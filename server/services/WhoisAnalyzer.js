const crypto = require('crypto');

class WhoisAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🌐 Analyzing WHOIS information for ${domain}`);
      
      // Always use mock data for lightweight backend
      const result = this.generateRealisticMockData(domain);
      console.log(`✅ Mock WHOIS analysis completed for ${domain} - Age: ${result.domainAge} days`);
      
      return result;

    } catch (error) {
      console.error(`❌ WHOIS analysis failed for ${domain}:`, error.message);
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

      // Generate registrar based on domain characteristics
      const registrars = [
        'GoDaddy.com, LLC',
        'Namecheap, Inc.',
        'Google LLC',
        'Cloudflare, Inc.',
        'Name.com, Inc.',
        'Network Solutions, LLC',
        'Tucows Domains Inc.',
        'eNom, LLC',
        'Hover',
        'Porkbun LLC',
        'Dynadot LLC',
        'NameSilo, LLC'
      ];
      
      result.registrar = registrars[Math.floor(seededRandom(seed) * registrars.length)];

      // Generate creation date (domain age)
      const now = new Date();
      const maxAgeYears = 20;
      const minAgeDays = 1;
      
      // Create age bias based on domain characteristics
      let ageMultiplier = seededRandom(seed * 2);
      
      // Well-known domains tend to be older
      if (domain.includes('google') || domain.includes('microsoft') || domain.includes('amazon') || domain.includes('facebook')) {
        ageMultiplier = 0.8 + (ageMultiplier * 0.2); // Bias towards older
      }
      // Test/demo domains tend to be newer
      else if (domain.includes('test') || domain.includes('demo') || domain.includes('staging')) {
        ageMultiplier = ageMultiplier * 0.3; // Bias towards newer
      }

      const ageDays = Math.max(minAgeDays, Math.floor(ageMultiplier * maxAgeYears * 365));
      result.creationDate = new Date(now.getTime() - ageDays * 24 * 60 * 60 * 1000);
      result.domainAge = ageDays;

      // Generate expiration date (1-10 years from now)
      const expirationYears = 1 + Math.floor(seededRandom(seed * 3) * 9);
      result.expirationDate = new Date(now.getTime() + expirationYears * 365 * 24 * 60 * 60 * 1000);
      result.daysUntilExpiry = Math.ceil((result.expirationDate - now) / (24 * 60 * 60 * 1000));

      // Generate updated date (within last 2 years)
      const daysSinceUpdate = Math.floor(seededRandom(seed * 4) * 730); // 0-730 days
      result.updatedDate = new Date(now.getTime() - daysSinceUpdate * 24 * 60 * 60 * 1000);

      // Generate status
      const statusOptions = [
        ['clientTransferProhibited', 'clientUpdateProhibited', 'clientDeleteProhibited'],
        ['ok'],
        ['clientTransferProhibited', 'serverTransferProhibited'],
        ['clientUpdateProhibited', 'serverUpdateProhibited'],
        ['active']
      ];
      
      result.status = statusOptions[Math.floor(seededRandom(seed * 5) * statusOptions.length)];

      // Generate name servers based on registrar
      const nameServerSets = {
        'GoDaddy.com, LLC': ['ns1.godaddy.com', 'ns2.godaddy.com'],
        'Namecheap, Inc.': ['dns1.registrar-servers.com', 'dns2.registrar-servers.com'],
        'Google LLC': ['ns-cloud-e1.googledomains.com', 'ns-cloud-e2.googledomains.com', 'ns-cloud-e3.googledomains.com'],
        'Cloudflare, Inc.': ['ben.ns.cloudflare.com', 'roxy.ns.cloudflare.com'],
        'Name.com, Inc.': ['ns1.name.com', 'ns2.name.com', 'ns3.name.com'],
        'default': [`ns1.${domain}`, `ns2.${domain}`]
      };

      result.nameServers = nameServerSets[result.registrar] || nameServerSets['default'];

      // Add some variety with custom DNS providers sometimes
      if (seededRandom(seed * 6) > 0.7) {
        const customDNS = [
          ['ns1.digitalocean.com', 'ns2.digitalocean.com', 'ns3.digitalocean.com'],
          ['dns1.p08.nsone.net', 'dns2.p08.nsone.net', 'dns3.p08.nsone.net', 'dns4.p08.nsone.net'],
          ['ns1.linode.com', 'ns2.linode.com', 'ns3.linode.com', 'ns4.linode.com', 'ns5.linode.com'],
          ['pdns1.ultradns.net', 'pdns2.ultradns.net', 'pdns3.ultradns.org', 'pdns4.ultradns.org']
        ];
        result.nameServers = customDNS[Math.floor(seededRandom(seed * 7) * customDNS.length)];
      }

      // Calculate security score
      result.score = this.calculateWhoisScore(result, result.domainAge, result.daysUntilExpiry);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result, result.domainAge, result.daysUntilExpiry);

      // Add details
      result.details = {
        hasPrivacy: this.checkPrivacyProtection(result.registrar, domain),
        hasDNSSEC: seededRandom(seed * 8) > 0.7, // 30% have DNSSEC
        registrarReputation: this.assessRegistrarReputation(result.registrar),
        contactInfo: this.generateContactInfo(domain, seededRandom(seed * 9)),
        rawData: this.generateRawWhoisData(result, domain)
      };

      return result;

    } catch (error) {
      console.error('Error generating mock WHOIS data:', error);
      return this.generateErrorResponse(error.message);
    }
  }

  static calculateWhoisScore(result, domainAge, daysUntilExpiry) {
    let score = 50; // Base score

    // Domain age scoring
    if (domainAge) {
      if (domainAge > 365 * 10) { // 10+ years
        score += 25;
      } else if (domainAge > 365 * 5) { // 5+ years
        score += 20;
      } else if (domainAge > 365 * 2) { // 2+ years
        score += 15;
      } else if (domainAge > 365) { // 1+ year
        score += 10;
      } else if (domainAge > 180) { // 6+ months
        score += 5;
      } else if (domainAge < 30) { // Less than 30 days
        score -= 25;
      } else if (domainAge < 90) { // Less than 3 months
        score -= 15;
      }
    }

    // Expiration date scoring
    if (daysUntilExpiry) {
      if (daysUntilExpiry < 30) {
        score -= 35; // Critical - domain expiring soon
      } else if (daysUntilExpiry < 90) {
        score -= 20; // Warning - domain expiring soon
      } else if (daysUntilExpiry < 180) {
        score -= 10; // Caution
      } else if (daysUntilExpiry > 365 * 2) {
        score += 15; // Good - long registration
      } else if (daysUntilExpiry > 365) {
        score += 10; // Good
      }
    }

    // Status scoring
    const goodStatuses = ['ok', 'active', 'clienttransferprohibited', 'clientupdateprohibited', 'clientdeleteprohibited'];
    const badStatuses = ['pendingdelete', 'redemptionperiod', 'clienthold', 'serverhold', 'pendingrenew'];
    
    for (const status of result.status) {
      const statusLower = status.toLowerCase();
      if (goodStatuses.some(s => statusLower.includes(s))) {
        score += 3;
      }
      if (badStatuses.some(s => statusLower.includes(s))) {
        score -= 20;
      }
    }

    // Name servers scoring
    if (result.nameServers.length >= 3) {
      score += 10; // Excellent - multiple name servers
    } else if (result.nameServers.length >= 2) {
      score += 5; // Good - standard redundancy
    } else if (result.nameServers.length === 1) {
      score -= 5; // Poor - single point of failure
    } else {
      score -= 15; // Bad - no name servers
    }

    // Registrar reputation
    if (result.details && result.details.registrarReputation === 'reputable') {
      score += 5;
    } else if (result.details && result.details.registrarReputation === 'unknown') {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  static generateRecommendations(result, domainAge, daysUntilExpiry) {
    const recommendations = [];

    // Domain age recommendations
    if (domainAge && domainAge < 30) {
      recommendations.push('🚨 Domain is very new (less than 30 days) - exercise caution');
    } else if (domainAge && domainAge < 90) {
      recommendations.push('⚠️ Domain is relatively new (less than 3 months) - verify legitimacy');
    }

    // Expiration recommendations
    if (daysUntilExpiry) {
      if (daysUntilExpiry < 30) {
        recommendations.push('🚨 CRITICAL: Domain expires in less than 30 days - renew immediately');
      } else if (daysUntilExpiry < 90) {
        recommendations.push('⚠️ Domain expires in less than 3 months - schedule renewal');
      } else if (daysUntilExpiry < 180) {
        recommendations.push('📅 Domain expires in less than 6 months - plan renewal');
      }
    }

    // Status recommendations
    if (result.status.length === 0) {
      recommendations.push('❓ No domain status information - verify domain legitimacy');
    } else {
      const hasProtection = result.status.some(status => 
        status.toLowerCase().includes('transferprohibited') ||
        status.toLowerCase().includes('deleteprohibited') ||
        status.toLowerCase().includes('updateprohibited')
      );
      
      if (!hasProtection) {
        recommendations.push('🔒 Consider enabling domain protection (transfer/delete lock)');
      }
    }

    // Name server recommendations
    if (result.nameServers.length < 2) {
      recommendations.push('⚡ Use multiple name servers (minimum 2) for redundancy');
    }

    // Privacy recommendations
    if (result.details && !result.details.hasPrivacy) {
      recommendations.push('🛡️ Consider domain privacy protection to hide personal information');
    }

    // DNSSEC recommendations
    if (result.details && !result.details.hasDNSSEC) {
      recommendations.push('🔐 Consider enabling DNSSEC for enhanced security');
    }

    // Positive indicators
    if (domainAge && domainAge > 365 * 5) {
      recommendations.push('✅ Domain has excellent age (5+ years) - positive trust indicator');
    }

    if (result.nameServers.length >= 3) {
      recommendations.push('✅ Good name server redundancy detected');
    }

    return recommendations;
  }

  static checkPrivacyProtection(registrar, domain) {
    // Simulate privacy protection based on registrar and domain patterns
    const privacyEnabledRegistrars = ['Namecheap, Inc.', 'Hover', 'Porkbun LLC'];
    const hash = crypto.createHash('md5').update(domain).digest('hex');
    const seed = parseInt(hash.substring(0, 4), 16);
    
    if (privacyEnabledRegistrars.includes(registrar)) {
      return (seed % 10) > 3; // 70% chance for privacy-focused registrars
    }
    
    return (seed % 10) > 6; // 40% chance for others
  }

  static assessRegistrarReputation(registrar) {
    if (!registrar) return 'unknown';

    const reputableRegistrars = [
      'GoDaddy.com, LLC',
      'Namecheap, Inc.',
      'Google LLC',
      'Cloudflare, Inc.',
      'Name.com, Inc.',
      'Hover',
      'Porkbun LLC'
    ];

    const suspiciousRegistrars = [
      'Unknown Registrar',
      'Private Registrar',
      'Domain Privacy Service'
    ];

    if (reputableRegistrars.includes(registrar)) {
      return 'reputable';
    } else if (suspiciousRegistrars.some(s => registrar.toLowerCase().includes(s.toLowerCase()))) {
      return 'suspicious';
    } else {
      return 'other';
    }
  }

  static generateContactInfo(domain, seed) {
    const hasPrivacy = seed > 0.6;
    
    if (hasPrivacy) {
      return {
        registrant: 'REDACTED FOR PRIVACY',
        admin: 'REDACTED FOR PRIVACY',
        tech: 'REDACTED FOR PRIVACY',
        privacyService: 'Domains By Proxy, LLC'
      };
    } else {
      return {
        registrant: 'Domain Administrator',
        admin: 'hostmaster@' + domain,
        tech: 'tech@' + domain,
        organization: 'Private'
      };
    }
  }

  static generateRawWhoisData(result, domain) {
    // Generate realistic raw WHOIS data
    const rawData = `
Domain Name: ${domain.toUpperCase()}
Registry Domain ID: ${crypto.createHash('md5').update(domain).digest('hex').toUpperCase()}
Registrar WHOIS Server: whois.registrar.com
Registrar URL: http://www.registrar.com
Updated Date: ${result.updatedDate.toISOString().split('T')[0]}T00:00:00Z
Creation Date: ${result.creationDate.toISOString().split('T')[0]}T00:00:00Z
Expiration Date: ${result.expirationDate.toISOString().split('T')[0]}T23:59:59Z
Registrar: ${result.registrar}
Registrar IANA ID: ${Math.floor(Math.random() * 9999) + 1000}
Domain Status: ${result.status.join(' ')}
Name Server: ${result.nameServers.join('\nName Server: ')}
DNSSEC: ${result.details.hasDNSSEC ? 'signedDelegation' : 'unsigned'}

>>> Last update of WHOIS database: ${new Date().toISOString().split('T')[0]}T${new Date().toISOString().split('T')[1]}
    `.trim();

    return rawData;
  }

  static generateErrorResponse(errorMessage) {
    return {
      error: errorMessage,
      registrar: null,
      creationDate: null,
      expirationDate: null,
      updatedDate: null,
      status: [],
      nameServers: [],
      domainAge: null,
      daysUntilExpiry: null,
      score: 0,
      recommendations: ['Unable to retrieve domain information - verify domain exists'],
      details: {
        rawData: null,
        hasPrivacy: false,
        hasDNSSEC: false,
        registrarReputation: 'unknown'
      }
    };
  }
}

module.exports = WhoisAnalyzer;