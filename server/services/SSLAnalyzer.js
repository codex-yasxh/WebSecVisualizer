const https = require('https');
const tls = require('tls');
const { URL } = require('url');

class SSLAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🔒 Analyzing SSL/TLS for ${domain}`);
      
      const result = {
        grade: 'F',
        protocols: [],
        ciphers: [],
        certificate: null,
        vulnerabilities: [],
        recommendations: [],
        score: 0
      };

      // Check if HTTPS is supported
      const hasHttps = await this.checkHttpsSupport(domain);
      if (!hasHttps) {
        result.grade = 'F';
        result.recommendations.push('Enable HTTPS for this domain');
        return result;
      }

      // Get SSL certificate information
      const certInfo = await this.getCertificateInfo(domain);
      if (certInfo) {
        result.certificate = certInfo;
        result.score += 20; // Base score for having SSL
      }

      // Check supported protocols
      const protocols = await this.checkProtocols(domain);
      result.protocols = protocols;
      
      // Calculate protocol score
      const protocolScore = this.calculateProtocolScore(protocols);
      result.score += protocolScore;

      // Check cipher suites
      const ciphers = await this.checkCiphers(domain);
      result.ciphers = ciphers;
      
      // Calculate cipher score
      const cipherScore = this.calculateCipherScore(ciphers);
      result.score += cipherScore;

      // Check for vulnerabilities
      const vulnerabilities = this.checkVulnerabilities(protocols, ciphers, certInfo);
      result.vulnerabilities = vulnerabilities;
      result.score -= vulnerabilities.length * 10;

      // Generate recommendations
      result.recommendations = this.generateRecommendations(protocols, ciphers, vulnerabilities, certInfo);

      // Calculate final grade
      result.grade = this.calculateGrade(result.score);

      console.log(`✅ SSL analysis completed for ${domain} - Grade: ${result.grade}`);
      
      return result;

    } catch (error) {
      console.error(`❌ SSL analysis failed for ${domain}:`, error.message);
      return {
        grade: 'F',
        error: error.message,
        protocols: [],
        ciphers: [],
        certificate: null,
        vulnerabilities: ['SSL analysis failed'],
        recommendations: ['Check SSL configuration'],
        score: 0
      };
    }
  }

  static async checkHttpsSupport(domain) {
    return new Promise((resolve) => {
      const req = https.request({
        hostname: domain,
        port: 443,
        method: 'HEAD',
        timeout: 10000
      }, (res) => {
        resolve(true);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  static async getCertificateInfo(domain) {
    return new Promise((resolve) => {
      const socket = tls.connect({
        host: domain,
        port: 443,
        servername: domain,
        timeout: 10000
      }, () => {
        const cert = socket.getPeerCertificate();
        if (cert && Object.keys(cert).length > 0) {
          resolve({
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            serialNumber: cert.serialNumber,
            fingerprint: cert.fingerprint,
            daysUntilExpiry: Math.ceil((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
          });
        } else {
          resolve(null);
        }
        socket.end();
      });

      socket.on('error', () => {
        resolve(null);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
    });
  }

  static async checkProtocols(domain) {
    const protocols = ['TLSv1.3', 'TLSv1.2', 'TLSv1.1', 'TLSv1.0', 'SSLv3'];
    const supportedProtocols = [];

    for (const protocol of protocols) {
      try {
        const isSupported = await this.testProtocol(domain, protocol);
        if (isSupported) {
          supportedProtocols.push(protocol);
        }
      } catch (error) {
        // Protocol not supported
      }
    }

    return supportedProtocols;
  }

  static async testProtocol(domain, protocol) {
    return new Promise((resolve) => {
      const socket = tls.connect({
        host: domain,
        port: 443,
        servername: domain,
        minVersion: protocol,
        maxVersion: protocol,
        timeout: 5000
      }, () => {
        resolve(true);
        socket.end();
      });

      socket.on('error', () => {
        resolve(false);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }

  static async checkCiphers(domain) {
    return new Promise((resolve) => {
      const socket = tls.connect({
        host: domain,
        port: 443,
        servername: domain,
        timeout: 10000
      }, () => {
        const cipher = socket.getCipher();
        resolve([{
          name: cipher.name,
          version: cipher.version,
          standardName: cipher.standardName
        }]);
        socket.end();
      });

      socket.on('error', () => {
        resolve([]);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve([]);
      });
    });
  }

  static calculateProtocolScore(protocols) {
    let score = 0;
    
    if (protocols.includes('TLSv1.3')) score += 40;
    if (protocols.includes('TLSv1.2')) score += 30;
    if (protocols.includes('TLSv1.1')) score += 10;
    if (protocols.includes('TLSv1.0')) score += 5;
    if (protocols.includes('SSLv3')) score -= 20; // Penalty for old SSL

    return Math.max(0, score);
  }

  static calculateCipherScore(ciphers) {
    if (ciphers.length === 0) return 0;
    
    // Check for strong ciphers
    const strongCiphers = ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256', 'TLS_AES_128_GCM_SHA256'];
    const hasStrongCipher = ciphers.some(cipher => 
      strongCiphers.includes(cipher.name) || cipher.name.includes('GCM') || cipher.name.includes('CHACHA20')
    );
    
    return hasStrongCipher ? 30 : 15;
  }

  static checkVulnerabilities(protocols, ciphers, certInfo) {
    const vulnerabilities = [];

    // Check for weak protocols
    if (protocols.includes('SSLv3')) {
      vulnerabilities.push('SSLv3 is vulnerable to POODLE attack');
    }
    if (protocols.includes('TLSv1.0')) {
      vulnerabilities.push('TLSv1.0 is considered weak');
    }
    if (protocols.includes('TLSv1.1')) {
      vulnerabilities.push('TLSv1.1 is considered weak');
    }

    // Check certificate expiry
    if (certInfo && certInfo.daysUntilExpiry < 30) {
      vulnerabilities.push(`Certificate expires in ${certInfo.daysUntilExpiry} days`);
    }

    // Check for weak ciphers
    const weakCiphers = ['RC4', 'DES', '3DES', 'MD5'];
    const hasWeakCipher = ciphers.some(cipher => 
      weakCiphers.some(weak => cipher.name.includes(weak))
    );
    if (hasWeakCipher) {
      vulnerabilities.push('Weak cipher suites detected');
    }

    return vulnerabilities;
  }

  static generateRecommendations(protocols, ciphers, vulnerabilities, certInfo) {
    const recommendations = [];

    if (!protocols.includes('TLSv1.3')) {
      recommendations.push('Enable TLS 1.3 for better security and performance');
    }

    if (protocols.includes('SSLv3') || protocols.includes('TLSv1.0') || protocols.includes('TLSv1.1')) {
      recommendations.push('Disable SSLv3, TLS 1.0, and TLS 1.1');
    }

    if (certInfo && certInfo.daysUntilExpiry < 30) {
      recommendations.push('Renew SSL certificate before expiration');
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Address identified vulnerabilities');
    }

    return recommendations;
  }

  static calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  }
}

module.exports = SSLAnalyzer; 