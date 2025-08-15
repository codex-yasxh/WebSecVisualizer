const crypto = require('crypto');

class PortAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🔌 Analyzing open ports for ${domain}`);
      
      // Always use mock data for lightweight backend
      const result = this.generateRealisticMockData(domain);
      console.log(`✅ Mock port analysis completed for ${domain} - Found ${result.openPorts.length} open ports`);
      
      return result;

    } catch (error) {
      console.error(`❌ Port analysis failed for ${domain}:`, error.message);
      return this.generateErrorResponse(error.message);
    }
  }

  static generateRealisticMockData(domain) {
    try {
      // Generate deterministic data based on domain hash
      const domainHash = crypto.createHash('md5').update(domain.toLowerCase()).digest('hex');
      const seed = parseInt(domainHash.substring(0, 8), 16);
      
      // Seeded random function for consistent results
      const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      const result = {
        openPorts: [],
        closedPorts: [],
        commonPorts: [],
        riskyPorts: [],
        score: 0,
        recommendations: [],
        details: {}
      };

      // Common ports to simulate scanning
      const commonPorts = [
        21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 
        3306, 5432, 27017, 6379, 8080, 8443, 3000, 5000, 9000
      ];
      
      result.commonPorts = commonPorts;

      // Determine domain type and typical port patterns
      const domainType = this.determineDomainType(domain);
      let baseOpenPorts = [];

      switch (domainType) {
        case 'web_server':
          baseOpenPorts = [80, 443]; // Basic web server
          if (seededRandom(seed * 2) > 0.7) baseOpenPorts.push(8080); // Alt HTTP
          if (seededRandom(seed * 3) > 0.8) baseOpenPorts.push(8443); // Alt HTTPS
          break;
          
        case 'mail_server':
          baseOpenPorts = [25, 143, 993, 80, 443]; // Mail + web
          if (seededRandom(seed * 4) > 0.6) baseOpenPorts.push(110, 995); // POP3
          break;
          
        case 'database_server':
          baseOpenPorts = [80, 443, 3306]; // Risky - DB exposed
          if (seededRandom(seed * 5) > 0.5) baseOpenPorts.push(5432); // PostgreSQL
          if (seededRandom(seed * 6) > 0.3) baseOpenPorts.push(27017); // MongoDB
          break;
          
        case 'development':
          baseOpenPorts = [80, 443, 3000, 8080]; // Dev ports
          if (seededRandom(seed * 7) > 0.6) baseOpenPorts.push(5000, 9000);
          if (seededRandom(seed * 8) > 0.4) baseOpenPorts.push(22); // SSH for dev
          break;
          
        case 'secure_enterprise':
          baseOpenPorts = [443]; // HTTPS only
          if (seededRandom(seed * 9) > 0.8) baseOpenPorts.push(22); // SSH (rare)
          break;
          
        case 'legacy_system':
          baseOpenPorts = [21, 23, 80]; // Insecure legacy ports
          if (seededRandom(seed * 10) > 0.7) baseOpenPorts.push(25, 110);
          break;
          
        default: // standard_web
          baseOpenPorts = [80, 443];
          if (seededRandom(seed * 11) > 0.9) baseOpenPorts.push(22); // Rare SSH
      }

      // Add some randomness while keeping it realistic
      const additionalPorts = [22, 25, 53, 143, 993, 995];
      for (const port of additionalPorts) {
        if (!baseOpenPorts.includes(port) && seededRandom(seed * port) > 0.85) {
          baseOpenPorts.push(port);
        }
      }

      // Remove duplicates and sort
      result.openPorts = [...new Set(baseOpenPorts)].sort((a, b) => a - b);
      result.closedPorts = commonPorts.filter(port => !result.openPorts.includes(port));

      // Identify risky ports
      result.riskyPorts = this.identifyRiskyPorts(result.openPorts);
      
      // Calculate security score
      result.score = this.calculatePortScore(result.openPorts, result.riskyPorts);
      
      // Generate recommendations
      result.recommendations = this.generateRecommendations(result.openPorts, result.riskyPorts, domainType);
      
      // Add details
      result.details = {
        totalScanned: commonPorts.length,
        openCount: result.openPorts.length,
        closedCount: result.closedPorts.length,
        riskyCount: result.riskyPorts.length,
        domainType: domainType,
        scanDuration: Math.floor(seededRandom(seed * 12) * 5000) + 2000, // 2-7 seconds
        methodology: 'mock_tcp_connect',
        serviceDetection: this.generateServiceInfo(result.openPorts, seed)
      };

      return result;

    } catch (error) {
      console.error('Error generating mock port data:', error);
      return this.generateErrorResponse(error.message);
    }
  }

  static determineDomainType(domain) {
    const domainLower = domain.toLowerCase();
    
    if (domainLower.includes('mail') || domainLower.includes('smtp') || domainLower.includes('imap')) {
      return 'mail_server';
    } else if (domainLower.includes('db') || domainLower.includes('database') || domainLower.includes('mysql') || domainLower.includes('postgres')) {
      return 'database_server';
    } else if (domainLower.includes('dev') || domainLower.includes('test') || domainLower.includes('staging') || domainLower.includes('localhost')) {
      return 'development';
    } else if (domainLower.includes('secure') || domainLower.includes('bank') || domainLower.includes('finance')) {
      return 'secure_enterprise';
    } else if (domainLower.includes('legacy') || domainLower.includes('old') || domainLower.includes('archive')) {
      return 'legacy_system';
    } else if (domainLower.includes('api') || domainLower.includes('service')) {
      return 'web_server';
    } else {
      return 'standard_web';
    }
  }

  static identifyRiskyPorts(openPorts) {
    const riskDefinitions = {
      // Critical risk ports
      21: { risk: 'critical', service: 'FTP', description: 'File Transfer Protocol - transmits credentials in plain text' },
      23: { risk: 'critical', service: 'Telnet', description: 'Telnet - unencrypted remote access protocol' },
      3306: { risk: 'critical', service: 'MySQL', description: 'MySQL database - should never be publicly accessible' },
      5432: { risk: 'critical', service: 'PostgreSQL', description: 'PostgreSQL database - should never be publicly accessible' },
      27017: { risk: 'critical', service: 'MongoDB', description: 'MongoDB database - should never be publicly accessible' },
      6379: { risk: 'critical', service: 'Redis', description: 'Redis database - often misconfigured without authentication' },
      
      // High risk ports
      22: { risk: 'high', service: 'SSH', description: 'SSH - secure but commonly targeted for brute force attacks' },
      25: { risk: 'high', service: 'SMTP', description: 'SMTP - can be abused for spam if misconfigured' },
      53: { risk: 'high', service: 'DNS', description: 'DNS - can be used for DDoS amplification attacks' },
      110: { risk: 'high', service: 'POP3', description: 'POP3 - transmits credentials in plain text' },
      143: { risk: 'high', service: 'IMAP', description: 'IMAP - transmits credentials in plain text' },
      
      // Medium risk ports
      80: { risk: 'medium', service: 'HTTP', description: 'HTTP - unencrypted web traffic, should redirect to HTTPS' },
      8080: { risk: 'medium', service: 'HTTP-Alt', description: 'Alternative HTTP port - often used for development/admin panels' },
      3000: { risk: 'medium', service: 'Development', description: 'Common development server port - should not be public' },
      5000: { risk: 'medium', service: 'Development', description: 'Common development server port - should not be public' },
      9000: { risk: 'medium', service: 'Development', description: 'Common development server port - should not be public' },
      
      // Low risk ports
      443: { risk: 'low', service: 'HTTPS', description: 'HTTPS - secure web traffic (recommended)' },
      993: { risk: 'low', service: 'IMAPS', description: 'IMAP over SSL - secure email protocol' },
      995: { risk: 'low', service: 'POP3S', description: 'POP3 over SSL - secure email protocol' },
      8443: { risk: 'low', service: 'HTTPS-Alt', description: 'Alternative HTTPS port - generally secure' }
    };

    const riskyPorts = [];
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
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    // Bonus for having HTTPS (443) open
    if (openPorts.includes(443)) {
      score += 10;
    }

    // Penalty for having HTTP (80) without HTTPS
    if (openPorts.includes(80) && !openPorts.includes(443)) {
      score -= 20;
    }

    // Major penalty for database ports
    const databasePorts = [3306, 5432, 27017, 6379];
    const openDatabasePorts = openPorts.filter(port => databasePorts.includes(port));
    score -= openDatabasePorts.length * 35;

    // Penalty for legacy insecure protocols
    const legacyPorts = [21, 23, 110, 143];
    const openLegacyPorts = openPorts.filter(port => legacyPorts.includes(port));
    score -= openLegacyPorts.length * 25;

    // Penalty for too many open ports
    if (openPorts.length > 5) {
      score -= (openPorts.length - 5) * 5;
    }

    // Bonus for minimal attack surface
    if (openPorts.length <= 2 && openPorts.includes(443)) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  static generateRecommendations(openPorts, riskyPorts, domainType) {
    const recommendations = [];

    // Critical issues first
    const criticalPorts = riskyPorts.filter(port => port.risk === 'critical');
    if (criticalPorts.length > 0) {
      recommendations.push(`🚨 CRITICAL: Close database/critical ports immediately (${criticalPorts.map(p => p.port).join(', ')}) - these should never be publicly accessible`);
    }

    // Database-specific recommendations
    const databasePorts = riskyPorts.filter(port => 
      [3306, 5432, 27017, 6379].includes(port.port)
    );
    if (databasePorts.length > 0) {
      recommendations.push(`🔒 Database Security: Move databases behind firewall and use VPN/private networks for access`);
    }

    // Legacy protocol recommendations
    const legacyPorts = riskyPorts.filter(port => 
      [21, 23, 110, 143].includes(port.port)
    );
    if (legacyPorts.length > 0) {
      recommendations.push(`🔧 Replace insecure protocols: ${legacyPorts.map(p => `${p.service} (${p.port})`).join(', ')} with secure alternatives (SFTP, SSH, IMAPS, POP3S)`);
    }

    // HTTP/HTTPS recommendations
    if (openPorts.includes(80) && !openPorts.includes(443)) {
      recommendations.push('🔐 Enable HTTPS (port 443) and redirect all HTTP traffic to HTTPS');
    } else if (openPorts.includes(80) && openPorts.includes(443)) {
      recommendations.push('✅ Ensure HTTP (port 80) properly redirects to HTTPS (port 443)');
    }

    // SSH recommendations
    if (openPorts.includes(22)) {
      recommendations.push('🛡️ SSH Security: Disable password authentication, use key-based auth, change default port, implement fail2ban');
    }

    // Development ports
    const devPorts = openPorts.filter(port => [3000, 5000, 8000, 8080, 9000].includes(port));
    if (devPorts.length > 0) {
      recommendations.push(`⚠️ Development ports detected (${devPorts.join(', ')}) - ensure these are not production services`);
    }

    // Mail server recommendations
    if (openPorts.includes(25)) {
      recommendations.push('📧 SMTP Security: Implement proper authentication, SPF, DKIM, and DMARC records');
    }

    // DNS recommendations
    if (openPorts.includes(53)) {
      recommendations.push('🌐 DNS Security: Configure rate limiting and disable recursion for public queries');
    }

    // General recommendations based on domain type
    switch (domainType) {
      case 'development':
        recommendations.push('🏗️ Development Environment: Ensure this is not accessible from production networks');
        break;
      case 'secure_enterprise':
        recommendations.push('🏢 Enterprise Security: Implement network segmentation and VPN access');
        break;
      case 'legacy_system':
        recommendations.push('⏰ Legacy System: Plan migration to modern, secure protocols');
        break;
    }

    // Positive reinforcement
    if (openPorts.length <= 2 && openPorts.includes(443) && !riskyPorts.some(p => p.risk === 'critical' || p.risk === 'high')) {
      recommendations.push('✅ Excellent port security - minimal attack surface detected');
    }

    // General security recommendations
    if (openPorts.length > 5) {
      recommendations.push(`📊 Attack Surface: ${openPorts.length} open ports detected - review and close unnecessary services`);
    }

    recommendations.push('🔍 Regular Monitoring: Implement continuous port monitoring and alerting');
    
    return recommendations;
  }

  static generateServiceInfo(openPorts, seed) {
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const serviceInfo = {};
    
    const commonServices = {
      21: { name: 'ProFTPD', version: '1.3.6', banner: 'ProFTPD Server ready' },
      22: { name: 'OpenSSH', version: '8.2p1', banner: 'SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5' },
      23: { name: 'Telnet', version: '0.17', banner: 'Ubuntu 20.04.3 LTS' },
      25: { name: 'Postfix', version: '3.4.13', banner: '220 mail.example.com ESMTP Postfix' },
      53: { name: 'BIND', version: '9.16.1', banner: 'BIND 9.16.1-Ubuntu' },
      80: { name: 'Apache', version: '2.4.41', banner: 'Apache/2.4.41 (Ubuntu) Server' },
      110: { name: 'Dovecot', version: '2.3.7.2', banner: '+OK Dovecot ready' },
      143: { name: 'Dovecot', version: '2.3.7.2', banner: '* OK [CAPABILITY IMAP4rev1] Dovecot ready' },
      443: { name: 'Apache', version: '2.4.41', banner: 'Apache/2.4.41 (Ubuntu) mod_ssl/2.4.41' },
      993: { name: 'Dovecot', version: '2.3.7.2', banner: '* OK [CAPABILITY IMAP4rev1] Dovecot ready' },
      995: { name: 'Dovecot', version: '2.3.7.2', banner: '+OK Dovecot ready' },
      3000: { name: 'Node.js', version: '16.14.0', banner: 'Express.js Development Server' },
      3306: { name: 'MySQL', version: '8.0.28', banner: '5.7.37-0ubuntu0.18.04.1' },
      5000: { name: 'Python', version: '3.8.10', banner: 'Flask Development Server' },
      5432: { name: 'PostgreSQL', version: '12.9', banner: 'PostgreSQL 12.9 on x86_64-pc-linux-gnu' },
      8080: { name: 'Jetty', version: '9.4.44', banner: 'Jetty/9.4.44.v20210927' },
      8443: { name: 'Apache', version: '2.4.41', banner: 'Apache/2.4.41 (Ubuntu) mod_ssl/2.4.41' },
      9000: { name: 'SonarQube', version: '8.9.6', banner: 'SonarQube Development Server' },
      27017: { name: 'MongoDB', version: '4.4.10', banner: 'MongoDB 4.4.10' }
    };

    for (const port of openPorts) {
      if (commonServices[port]) {
        const service = { ...commonServices[port] };
        
        // Add some variation to versions
        if (seededRandom(seed * port) > 0.7) {
          const versionParts = service.version.split('.');
          if (versionParts.length >= 2) {
            versionParts[versionParts.length - 1] = String(parseInt(versionParts[versionParts.length - 1]) + Math.floor(seededRandom(seed * port * 2) * 5));
            service.version = versionParts.join('.');
          }
        }
        
        serviceInfo[port] = service;
      }
    }

    return serviceInfo;
  }

  static generateErrorResponse(errorMessage) {
    return {
      error: errorMessage,
      openPorts: [],
      closedPorts: [],
      commonPorts: [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 5432, 27017],
      riskyPorts: [],
      score: 0,
      recommendations: ['Unable to perform port scan - check network connectivity'],
      details: {
        totalScanned: 0,
        openCount: 0,
        closedCount: 0,
        riskyCount: 0,
        scanDuration: 0,
        error: errorMessage
      }
    };
  }
}

module.exports = PortAnalyzer;