const net = require('net');
const dns = require('dns').promises;

class PortAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🔌 Analyzing open ports for ${domain}`);
      
      const result = {
        openPorts: [],
        closedPorts: [],
        commonPorts: [],
        riskyPorts: [],
        score: 0,
        recommendations: [],
        details: {}
      };

      // Common ports to scan
      const commonPorts = [
        21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 8080, 8443, 3306, 5432, 27017
      ];

      // Scan ports
      const scanResults = await this.scanPorts(domain, commonPorts);
      
      result.openPorts = scanResults.open;
      result.closedPorts = scanResults.closed;
      result.commonPorts = commonPorts;

      // Identify risky ports
      result.riskyPorts = this.identifyRiskyPorts(scanResults.open);
      
      // Calculate security score
      result.score = this.calculatePortScore(scanResults.open, result.riskyPorts);
      
      // Generate recommendations
      result.recommendations = this.generateRecommendations(scanResults.open, result.riskyPorts);
      
      // Add details
      result.details = {
        totalScanned: commonPorts.length,
        openCount: scanResults.open.length,
        closedCount: scanResults.closed.length,
        riskyCount: result.riskyPorts.length,
        scanDuration: scanResults.duration
      };

      console.log(`✅ Port analysis completed for ${domain} - Found ${result.openPorts.length} open ports`);
      
      return result;

    } catch (error) {
      console.error(`❌ Port analysis failed for ${domain}:`, error.message);
      return {
        error: error.message,
        openPorts: [],
        closedPorts: [],
        commonPorts: [],
        riskyPorts: [],
        score: 0,
        recommendations: ['Check network connectivity'],
        details: {}
      };
    }
  }

  static async scanPorts(domain, ports) {
    const startTime = Date.now();
    const results = {
      open: [],
      closed: [],
      duration: 0
    };

    // Resolve domain to IP
    let ipAddress;
    try {
      const addresses = await dns.resolve4(domain);
      ipAddress = addresses[0];
    } catch (error) {
      console.error(`DNS resolution failed for ${domain}:`, error.message);
      return results;
    }

    // Scan ports in parallel with timeout
    const scanPromises = ports.map(port => this.scanPort(ipAddress, port));
    
    try {
      const portResults = await Promise.allSettled(scanPromises);
      
      portResults.forEach((result, index) => {
        const port = ports[index];
        if (result.status === 'fulfilled' && result.value) {
          results.open.push(port);
        } else {
          results.closed.push(port);
        }
      });
    } catch (error) {
      console.error('Port scanning error:', error.message);
    }

    results.duration = Date.now() - startTime;
    return results;
  }

  static async scanPort(ip, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(false);
        }
      }, 3000); // 3 second timeout

      socket.connect(port, ip, () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          socket.destroy();
          resolve(true);
        }
      });

      socket.on('error', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      });

      socket.on('timeout', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          socket.destroy();
          resolve(false);
        }
      });
    });
  }

  static identifyRiskyPorts(openPorts) {
    const riskyPorts = [];
    
    const riskDefinitions = {
      // High risk ports
      21: { risk: 'high', service: 'FTP', description: 'File Transfer Protocol - often unencrypted' },
      23: { risk: 'high', service: 'Telnet', description: 'Telnet - unencrypted remote access' },
      25: { risk: 'medium', service: 'SMTP', description: 'Simple Mail Transfer Protocol' },
      53: { risk: 'medium', service: 'DNS', description: 'Domain Name System' },
      110: { risk: 'medium', service: 'POP3', description: 'Post Office Protocol - often unencrypted' },
      143: { risk: 'medium', service: 'IMAP', description: 'Internet Message Access Protocol - often unencrypted' },
      3306: { risk: 'high', service: 'MySQL', description: 'MySQL database - should not be publicly accessible' },
      5432: { risk: 'high', service: 'PostgreSQL', description: 'PostgreSQL database - should not be publicly accessible' },
      27017: { risk: 'high', service: 'MongoDB', description: 'MongoDB database - should not be publicly accessible' },
      
      // Medium risk ports
      22: { risk: 'medium', service: 'SSH', description: 'Secure Shell - should use key-based authentication' },
      80: { risk: 'low', service: 'HTTP', description: 'Hypertext Transfer Protocol - should redirect to HTTPS' },
      443: { risk: 'low', service: 'HTTPS', description: 'HTTP Secure - good for web traffic' },
      8080: { risk: 'medium', service: 'HTTP-Alt', description: 'Alternative HTTP port - often used for development' },
      8443: { risk: 'medium', service: 'HTTPS-Alt', description: 'Alternative HTTPS port' },
      993: { risk: 'low', service: 'IMAPS', description: 'IMAP over SSL' },
      995: { risk: 'low', service: 'POP3S', description: 'POP3 over SSL' }
    };

    for (const port of openPorts) {
      if (riskDefinitions[port]) {
        riskyPorts.push({
          port: port,
          ...riskDefinitions[port]
        });
      }
    }

    return riskyPorts;
  }

  static calculatePortScore(openPorts, riskyPorts) {
    let score = 100; // Start with perfect score
    
    // Deduct points for each risky port
    for (const riskyPort of riskyPorts) {
      switch (riskyPort.risk) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    // Bonus for having HTTPS (443) open
    if (openPorts.includes(443)) {
      score += 10;
    }

    // Penalty for having HTTP (80) without HTTPS
    if (openPorts.includes(80) && !openPorts.includes(443)) {
      score -= 15;
    }

    // Penalty for having database ports open
    const databasePorts = [3306, 5432, 27017, 6379, 5984];
    const openDatabasePorts = openPorts.filter(port => databasePorts.includes(port));
    score -= openDatabasePorts.length * 25;

    return Math.max(0, Math.min(100, score));
  }

  static generateRecommendations(openPorts, riskyPorts) {
    const recommendations = [];

    // Check for database ports
    const databasePorts = riskyPorts.filter(port => 
      [3306, 5432, 27017].includes(port.port)
    );
    
    if (databasePorts.length > 0) {
      recommendations.push(`Close database ports (${databasePorts.map(p => p.port).join(', ')}) - databases should not be publicly accessible`);
    }

    // Check for unencrypted services
    const unencryptedPorts = riskyPorts.filter(port => 
      [21, 23, 25, 110, 143].includes(port.port)
    );
    
    if (unencryptedPorts.length > 0) {
      recommendations.push(`Replace unencrypted services with encrypted alternatives (ports: ${unencryptedPorts.map(p => p.port).join(', ')})`);
    }

    // Check for HTTP without HTTPS
    if (openPorts.includes(80) && !openPorts.includes(443)) {
      recommendations.push('Enable HTTPS (port 443) and redirect HTTP traffic to HTTPS');
    }

    // Check for development ports
    const devPorts = openPorts.filter(port => [8080, 8443, 3000, 5000, 8000].includes(port));
    if (devPorts.length > 0) {
      recommendations.push(`Close development ports (${devPorts.join(', ')}) in production environment`);
    }

    // General recommendations
    if (riskyPorts.length > 0) {
      recommendations.push('Review and close unnecessary open ports to reduce attack surface');
    }

    if (openPorts.length === 0) {
      recommendations.push('No common ports are open - verify this is intentional');
    }

    return recommendations;
  }

  static getPortService(port) {
    const services = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      3306: 'MySQL',
      5432: 'PostgreSQL',
      27017: 'MongoDB',
      8080: 'HTTP-Alt',
      8443: 'HTTPS-Alt'
    };

    return services[port] || 'Unknown';
  }
}

module.exports = PortAnalyzer; 