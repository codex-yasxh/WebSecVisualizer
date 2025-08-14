const whois = require('whois');
const { promisify } = require('util');

class WhoisAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🌐 Analyzing WHOIS information for ${domain}`);
      
      const result = {
        registrar: null,
        creationDate: null,
        expirationDate: null,
        updatedDate: null,
        status: [],
        nameServers: [],
        domainAge: null,
        daysUntilExpiry: null,
        score: 0,
        recommendations: [],
        details: {}
      };

      // Get WHOIS data
      const whoisData = await this.getWhoisData(domain);
      if (!whoisData) {
        result.error = 'Could not retrieve WHOIS information';
        return result;
      }

      // Parse WHOIS data
      const parsedData = this.parseWhoisData(whoisData, domain);
      
      result.registrar = parsedData.registrar;
      result.creationDate = parsedData.creationDate;
      result.expirationDate = parsedData.expirationDate;
      result.updatedDate = parsedData.updatedDate;
      result.status = parsedData.status;
      result.nameServers = parsedData.nameServers;

      // Calculate derived metrics
      result.domainAge = this.calculateDomainAge(parsedData.creationDate);
      result.daysUntilExpiry = this.calculateDaysUntilExpiry(parsedData.expirationDate);
      
      // Calculate security score
      result.score = this.calculateWhoisScore(parsedData, result.domainAge, result.daysUntilExpiry);
      
      // Generate recommendations
      result.recommendations = this.generateRecommendations(parsedData, result.domainAge, result.daysUntilExpiry);
      
      // Add details
      result.details = {
        rawData: whoisData,
        hasPrivacy: this.checkPrivacyProtection(parsedData),
        hasDNSSEC: this.checkDNSSEC(parsedData),
        registrarReputation: this.assessRegistrarReputation(parsedData.registrar)
      };

      console.log(`✅ WHOIS analysis completed for ${domain} - Age: ${result.domainAge} days`);
      
      return result;

    } catch (error) {
      console.error(`❌ WHOIS analysis failed for ${domain}:`, error.message);
      return {
        error: error.message,
        registrar: null,
        creationDate: null,
        expirationDate: null,
        updatedDate: null,
        status: [],
        nameServers: [],
        domainAge: null,
        daysUntilExpiry: null,
        score: 0,
        recommendations: ['Check domain registration status'],
        details: {}
      };
    }
  }

  static async getWhoisData(domain) {
    try {
      const whoisLookup = promisify(whois.lookup);
      const data = await whoisLookup(domain);
      return data;
    } catch (error) {
      console.error('WHOIS lookup failed:', error.message);
      return null;
    }
  }

  static parseWhoisData(rawData, domain) {
    const data = rawData.toLowerCase();
    const lines = data.split('\n');
    
    const parsed = {
      registrar: null,
      creationDate: null,
      expirationDate: null,
      updatedDate: null,
      status: [],
      nameServers: []
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Registrar
      if (trimmedLine.startsWith('registrar:') || trimmedLine.startsWith('sponsoring registrar:')) {
        parsed.registrar = line.split(':')[1]?.trim() || null;
      }
      
      // Creation date
      if (trimmedLine.startsWith('creation date:') || trimmedLine.startsWith('created:') || trimmedLine.startsWith('domain registration date:')) {
        const dateStr = line.split(':')[1]?.trim();
        if (dateStr) {
          parsed.creationDate = this.parseDate(dateStr);
        }
      }
      
      // Expiration date
      if (trimmedLine.startsWith('expiration date:') || trimmedLine.startsWith('expires:') || trimmedLine.startsWith('registry expiry date:')) {
        const dateStr = line.split(':')[1]?.trim();
        if (dateStr) {
          parsed.expirationDate = this.parseDate(dateStr);
        }
      }
      
      // Updated date
      if (trimmedLine.startsWith('updated date:') || trimmedLine.startsWith('last updated:') || trimmedLine.startsWith('last modified:')) {
        const dateStr = line.split(':')[1]?.trim();
        if (dateStr) {
          parsed.updatedDate = this.parseDate(dateStr);
        }
      }
      
      // Status
      if (trimmedLine.startsWith('status:') && !trimmedLine.includes('client')) {
        const status = line.split(':')[1]?.trim();
        if (status && !parsed.status.includes(status)) {
          parsed.status.push(status);
        }
      }
      
      // Name servers
      if (trimmedLine.startsWith('name server:') || trimmedLine.startsWith('nserver:')) {
        const ns = line.split(':')[1]?.trim();
        if (ns && !parsed.nameServers.includes(ns)) {
          parsed.nameServers.push(ns);
        }
      }
    }

    return parsed;
  }

  static parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Try different date formats
    const dateFormats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})-(\w{3})-(\d{4})/, // DD-MMM-YYYY
      /(\d{4})\.(\d{2})\.(\d{2})/, // YYYY.MM.DD
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
    ];

    for (const format of dateFormats) {
      const match = dateStr.match(format);
      if (match) {
        try {
          if (format.source.includes('MMM')) {
            // Handle month names
            const months = {
              jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
              jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            const month = months[match[2].toLowerCase()];
            const day = parseInt(match[1]);
            const year = parseInt(match[3]);
            return new Date(year, month, day);
          } else {
            // Handle numeric formats
            const parts = match.slice(1).map(Number);
            if (format.source.includes('YYYY')) {
              return new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              return new Date(parts[2], parts[0] - 1, parts[1]);
            }
          }
        } catch (error) {
          continue;
        }
      }
    }

    // Fallback to Date constructor
    try {
      return new Date(dateStr);
    } catch (error) {
      return null;
    }
  }

  static calculateDomainAge(creationDate) {
    if (!creationDate) return null;
    
    const now = new Date();
    const diffTime = Math.abs(now - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  static calculateDaysUntilExpiry(expirationDate) {
    if (!expirationDate) return null;
    
    const now = new Date();
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  static calculateWhoisScore(parsedData, domainAge, daysUntilExpiry) {
    let score = 50; // Base score

    // Domain age scoring
    if (domainAge) {
      if (domainAge > 365 * 5) { // 5+ years
        score += 20;
      } else if (domainAge > 365 * 2) { // 2+ years
        score += 15;
      } else if (domainAge > 365) { // 1+ year
        score += 10;
      } else if (domainAge < 30) { // Less than 30 days
        score -= 20;
      }
    }

    // Expiration date scoring
    if (daysUntilExpiry) {
      if (daysUntilExpiry < 30) {
        score -= 30; // Critical - domain expiring soon
      } else if (daysUntilExpiry < 90) {
        score -= 15; // Warning - domain expiring soon
      } else if (daysUntilExpiry > 365) {
        score += 10; // Good - long registration
      }
    }

    // Status scoring
    if (parsedData.status.length > 0) {
      const goodStatuses = ['ok', 'active', 'clienttransferprohibited'];
      const badStatuses = ['pendingdelete', 'redemptionperiod', 'clienthold'];
      
      for (const status of parsedData.status) {
        if (goodStatuses.some(s => status.toLowerCase().includes(s))) {
          score += 5;
        }
        if (badStatuses.some(s => status.toLowerCase().includes(s))) {
          score -= 15;
        }
      }
    }

    // Name servers scoring
    if (parsedData.nameServers.length >= 2) {
      score += 10; // Good - multiple name servers
    } else if (parsedData.nameServers.length === 0) {
      score -= 10; // Bad - no name servers
    }

    return Math.max(0, Math.min(100, score));
  }

  static generateRecommendations(parsedData, domainAge, daysUntilExpiry) {
    const recommendations = [];

    // Domain age recommendations
    if (domainAge && domainAge < 30) {
      recommendations.push('Domain is very new - be cautious of newly registered domains');
    }

    // Expiration recommendations
    if (daysUntilExpiry) {
      if (daysUntilExpiry < 30) {
        recommendations.push('Domain expires soon - renew immediately to prevent hijacking');
      } else if (daysUntilExpiry < 90) {
        recommendations.push('Domain expires in less than 3 months - consider renewing');
      }
    }

    // Status recommendations
    if (parsedData.status.length === 0) {
      recommendations.push('No domain status information available - verify domain legitimacy');
    }

    // Name server recommendations
    if (parsedData.nameServers.length < 2) {
      recommendations.push('Consider using multiple name servers for redundancy');
    }

    // General recommendations
    if (domainAge && domainAge > 365 * 5) {
      recommendations.push('Domain has good age - this is a positive security indicator');
    }

    return recommendations;
  }

  static checkPrivacyProtection(parsedData) {
    // Check for privacy protection indicators
    const privacyIndicators = [
      'privacy',
      'proxy',
      'whoisguard',
      'domainsbyproxy',
      'private',
      'redacted'
    ];

    const dataStr = JSON.stringify(parsedData).toLowerCase();
    return privacyIndicators.some(indicator => dataStr.includes(indicator));
  }

  static checkDNSSEC(parsedData) {
    // Check for DNSSEC indicators
    const dnssecIndicators = [
      'dnssec',
      'secure',
      'signed'
    ];

    const dataStr = JSON.stringify(parsedData).toLowerCase();
    return dnssecIndicators.some(indicator => dataStr.includes(indicator));
  }

  static assessRegistrarReputation(registrar) {
    if (!registrar) return 'unknown';

    const reputableRegistrars = [
      'godaddy',
      'namecheap',
      'google',
      'cloudflare',
      'name.com',
      'hover',
      'porkbun',
      'namesilo'
    ];

    const registrarLower = registrar.toLowerCase();
    
    if (reputableRegistrars.some(r => registrarLower.includes(r))) {
      return 'reputable';
    } else if (registrarLower.includes('unknown') || registrarLower.includes('n/a')) {
      return 'unknown';
    } else {
      return 'other';
    }
  }
}

module.exports = WhoisAnalyzer; 