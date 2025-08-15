const crypto = require('crypto');

class SSLAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🔒 Analyzing SSL/TLS for ${domain}`);
      // Always use mock data for lightweight backend
      const result = this.generateRealisticMockData(domain);
      console.log(`✅ Mock SSL analysis completed for ${domain} - Grade: ${result.grade}`);
      return result;

    } catch (error) {
      console.error(`❌ SSL analysis failed for ${domain}:`, error.message);
      return this.generateErrorResponse(error.message);
    }
  }

  /* ---------------------------- Mock data generator --------------------------- */
  static generateRealisticMockData(domain) {
    try {
      // Deterministic hash-based seed so repeated calls for same domain give same mock
      const domainHash = crypto.createHash('md5').update(domain.toLowerCase()).digest('hex');
      const seed = parseInt(domainHash.substring(0, 8), 16) || 1;

      const result = {
        grade: 'F',
        protocols: [],
        ciphers: [],
        certificate: null,
        vulnerabilities: [],
        recommendations: [],
        score: 0,
        details: {}
      };

      const sslQuality = this.determineSslQuality(domain, seed);

      result.protocols = this.generateProtocols(sslQuality, seed);
      result.certificate = this.generateCertificate(domain, sslQuality, seed);
      result.ciphers = this.generateCiphers(sslQuality, seed);
      result.vulnerabilities = this.generateVulnerabilities(result.protocols, result.ciphers, result.certificate, sslQuality);
      result.score = this.calculateSslScore(result.protocols, result.ciphers, result.certificate, result.vulnerabilities);
      result.grade = this.calculateGrade(result.score);
      result.recommendations = this.generateRecommendations(result.protocols, result.ciphers, result.vulnerabilities, result.certificate, sslQuality);

      result.details = {
        hasSSL: !!result.certificate,
        sslQuality: sslQuality,
        chainIssues: this.generateChainIssues(sslQuality, seed),
        ocspStapling: this.seededRandom(seed * 7) > 0.3,
        hstsEnabled: this.seededRandom(seed * 8) > 0.4,
        httpRedirect: this.seededRandom(seed * 9) > 0.2,
        weakCiphers: result.ciphers.filter(c => c.strength === 'weak').length,
        strongCiphers: result.ciphers.filter(c => c.strength === 'strong').length
      };

      return result;

    } catch (error) {
      console.error('Error generating mock SSL data:', error);
      return this.generateErrorResponse(error.message);
    }
  }

  /* ------------------------------- Helpers --------------------------------- */
  static seededRandom(n) {
    // deterministic pseudo-random in range [0,1) based on input number
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  }

  static determineSslQuality(domain, seed) {
    const domainLower = domain.toLowerCase();

    if (domainLower.includes('bank') || domainLower.includes('secure') ||
        domainLower.includes('finance') || domainLower.includes('payment') ||
        domainLower.includes('google') || domainLower.includes('microsoft') ||
        domainLower.includes('amazon') || domainLower.includes('apple')) {
      return 'excellent';
    }

    if (domainLower.includes('test') || domainLower.includes('demo') ||
        domainLower.includes('old') || domainLower.includes('legacy') ||
        domainLower.includes('insecure')) {
      return 'poor';
    }

    if (domainLower.includes('dev') || domainLower.includes('staging') ||
        domainLower.includes('localhost')) {
      return 'development';
    }

    const random = this.seededRandom(seed);
    if (random > 0.8) return 'excellent';
    if (random > 0.6) return 'good';
    if (random > 0.4) return 'average';
    if (random > 0.2) return 'below_average';
    return 'poor';
  }

  static generateProtocols(sslQuality, seed) {
    const protocols = [];
    switch (sslQuality) {
      case 'excellent':
        protocols.push('TLSv1.3', 'TLSv1.2');
        break;
      case 'good':
        protocols.push('TLSv1.2');
        if (this.seededRandom(seed * 2) > 0.7) protocols.push('TLSv1.3');
        if (this.seededRandom(seed * 3) > 0.8) protocols.push('TLSv1.1');
        break;
      case 'average':
        protocols.push('TLSv1.2', 'TLSv1.1');
        if (this.seededRandom(seed * 4) > 0.6) protocols.push('TLSv1.0');
        break;
      case 'below_average':
        protocols.push('TLSv1.1', 'TLSv1.0');
        if (this.seededRandom(seed * 5) > 0.7) protocols.push('TLSv1.2');
        if (this.seededRandom(seed * 6) > 0.9) protocols.push('SSLv3');
        break;
      case 'poor':
        protocols.push('TLSv1.0');
        if (this.seededRandom(seed * 7) > 0.5) protocols.push('SSLv3');
        if (this.seededRandom(seed * 8) > 0.6) protocols.push('TLSv1.1');
        break;
      case 'development':
        protocols.push('TLSv1.2');
        if (this.seededRandom(seed * 9) > 0.5) protocols.push('TLSv1.1', 'TLSv1.0');
        break;
    }
    return [...new Set(protocols)];
  }

  static generateCertificate(domain, sslQuality, seed) {
    // produce realistic certificate mock
    const now = new Date();
    let validFromDays, validToDays;
    switch (sslQuality) {
      case 'excellent':
        validFromDays = Math.floor(this.seededRandom(seed * 10) * 30) + 30; // 30-60 days ago
        validToDays = Math.floor(this.seededRandom(seed * 11) * 180) + 275; // 275-455 days from now
        break;
      case 'good':
        validFromDays = Math.floor(this.seededRandom(seed * 12) * 90) + 30; // 30-120 days ago
        validToDays = Math.floor(this.seededRandom(seed * 13) * 120) + 90; // 90-210 days from now
        break;
      case 'average':
        validFromDays = Math.floor(this.seededRandom(seed * 14) * 180) + 60; // 60-240 days ago
        validToDays = Math.floor(this.seededRandom(seed * 15) * 90) + 30; // 30-120 days from now
        break;
      case 'below_average':
        validFromDays = Math.floor(this.seededRandom(seed * 16) * 365) + 90; // 90-455 days ago
        validToDays = Math.floor(this.seededRandom(seed * 17) * 60) + 10; // 10-70 days from now
        break;
      case 'poor':
        validFromDays = Math.floor(this.seededRandom(seed * 18) * 730) + 180; // 180-910 days ago
        validToDays = Math.floor(this.seededRandom(seed * 19) * 30) + 5; // 5-35 days from now
        break;
      default:
        validFromDays = 90;
        validToDays = 90;
    }

    const validFrom = new Date(now.getTime() - validFromDays * 24 * 60 * 60 * 1000);
    const validTo = new Date(now.getTime() + validToDays * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((validTo - now) / (24 * 60 * 60 * 1000));

    const issuer = `${this.seededRandom(seed * 21) > 0.5 ? 'Let\'s Encrypt' : 'DigiCert'}`;
    const subject = `CN=${domain}`;
    const isSelfSigned = this.seededRandom(seed * 22) > 0.95; // rare

    return {
      issuer,
      subject,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      daysRemaining,
      expired: daysRemaining <= 0,
      signatureAlgorithm: this.seededRandom(seed * 23) > 0.6 ? 'rsa-sha256' : 'ecdsa-sha256',
      isSelfSigned
    };
  }

  static generateCiphers(sslQuality, seed) {
    const cipherPool = [
      { name: 'TLS_AES_128_GCM_SHA256', bits: 128, strength: 'strong' },
      { name: 'TLS_AES_256_GCM_SHA384', bits: 256, strength: 'strong' },
      { name: 'ECDHE-RSA-AES128-GCM-SHA256', bits: 128, strength: 'strong' },
      { name: 'ECDHE-RSA-AES256-GCM-SHA384', bits: 256, strength: 'strong' },
      { name: 'AES128-SHA', bits: 128, strength: 'medium' },
      { name: 'AES256-SHA', bits: 256, strength: 'medium' },
      { name: 'RC4-SHA', bits: 128, strength: 'weak' },
      { name: 'DES-CBC3-SHA', bits: 168, strength: 'weak' },
      { name: 'SSLv3-KRB5', bits: 56, strength: 'weak' }
    ];

    // pick based on quality
    let picks = [];
    switch (sslQuality) {
      case 'excellent':
        picks = [cipherPool[1], cipherPool[0], cipherPool[2], cipherPool[3]];
        break;
      case 'good':
        picks = [cipherPool[0], cipherPool[2], cipherPool[4]];
        break;
      case 'average':
        picks = [cipherPool[2], cipherPool[4], cipherPool[5]];
        break;
      case 'below_average':
        picks = [cipherPool[4], cipherPool[6], cipherPool[7]];
        break;
      case 'poor':
        picks = [cipherPool[6], cipherPool[7], cipherPool[8]];
        break;
      case 'development':
        picks = [cipherPool[0], cipherPool[4]];
        break;
      default:
        picks = [cipherPool[4], cipherPool[5]];
    }

    // add small randomization
    const out = [];
    for (let i = 0; i < picks.length; i++) {
      const p = picks[i];
      out.push({ name: p.name, bits: p.bits, strength: p.strength });
    }

    return out;
  }

  static generateVulnerabilities(protocols, ciphers, certificate, sslQuality) {
    const vulns = [];

    // Protocol-based vulns
    if (protocols.includes('SSLv3')) vulns.push({ id: 'POODLE', severity: 'high', description: 'SSLv3 is vulnerable to POODLE attacks.' });
    if (protocols.includes('TLSv1.0') || protocols.includes('TLSv1.1')) vulns.push({ id: 'LEGACY_TLS', severity: 'medium', description: 'Legacy TLS versions have known weaknesses.' });

    // Cipher-based vulns
    if (ciphers.some(c => c.name.includes('RC4'))) vulns.push({ id: 'RC4', severity: 'high', description: 'RC4 cipher is insecure and must not be used.' });
    if (ciphers.some(c => c.strength === 'weak')) vulns.push({ id: 'WEAK_CIPHERS', severity: 'medium', description: 'Weak cipher suites present.' });

    // Certificate issues
    if (certificate.isSelfSigned) vulns.push({ id: 'SELF_SIGNED', severity: 'high', description: 'Certificate is self-signed.' });
    if (certificate.expired) vulns.push({ id: 'CERT_EXPIRED', severity: 'high', description: 'Certificate has expired.' });
    if (certificate.daysRemaining < 14 && !certificate.expired) vulns.push({ id: 'CERT_NEAR_EXPIRY', severity: 'medium', description: 'Certificate is near expiry.' });

    // Randomly inject a rare vulnerability for poor config
    if (sslQuality === 'poor' && this.seededRandom(parseInt(certificate.daysRemaining || 1) + 99) > 0.7) {
      vulns.push({ id: 'HEARTBLEED_MOCK', severity: 'critical', description: 'Mock: Heartbleed-like vulnerability flagged in handshake.' });
    }

    return vulns;
  }

  static calculateSslScore(protocols, ciphers, certificate, vulnerabilities) {
    // Base score
    let score = 50;

    // protocols
    if (protocols.includes('TLSv1.3')) score += 20;
    if (protocols.includes('TLSv1.2')) score += 10;
    if (protocols.includes('TLSv1.1')) score -= 5;
    if (protocols.includes('TLSv1.0')) score -= 10;
    if (protocols.includes('SSLv3')) score -= 25;

    // ciphers: reward strong, penalize weak
    const strong = ciphers.filter(c => c.strength === 'strong').length;
    const weak = ciphers.filter(c => c.strength === 'weak').length;
    score += strong * 8;
    score -= weak * 12;

    // certificate
    if (certificate.expired) score -= 30;
    if (certificate.isSelfSigned) score -= 20;
    if (certificate.daysRemaining > 180) score += 10;
    if (certificate.signatureAlgorithm && certificate.signatureAlgorithm.includes('ecdsa')) score += 5;

    // vulnerabilities
    vulnerabilities.forEach(v => {
      if (v.severity === 'critical') score -= 30;
      if (v.severity === 'high') score -= 15;
      if (v.severity === 'medium') score -= 7;
      if (v.severity === 'low') score -= 3;
    });

    // clamp
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    return Math.round(score);
  }

  static calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  static generateRecommendations(protocols, ciphers, vulnerabilities, certificate, sslQuality) {
    const recs = [];

    // Protocol recommendations
    if (!protocols.includes('TLSv1.3')) recs.push('Enable TLSv1.3 where possible for better performance and security.');
    if (protocols.includes('SSLv3') || protocols.includes('TLSv1.0') || protocols.includes('TLSv1.1')) recs.push('Disable legacy protocols: SSLv3, TLSv1.0, and TLSv1.1.');

    // Cipher recommendations
    if (ciphers.some(c => c.strength === 'weak')) recs.push('Remove weak cipher suites (RC4, DES, or SSLv3-based suites).');
    if (!ciphers.some(c => c.name.includes('GCM'))) recs.push('Prefer AEAD ciphers (AES-GCM or ChaCha20-Poly1305).');

    // Certificate recs
    if (certificate.isSelfSigned) recs.push('Replace self-signed certificate with one from a trusted CA.');
    if (certificate.expired) recs.push('Renew the TLS certificate immediately.');
    if (certificate.daysRemaining < 30 && !certificate.expired) recs.push('Plan certificate renewal soon (less than 30 days remaining).');

    // OCSP/HSTS
    if (!this.seededRandom(1) > 0.5) { /* noop just to keep deterministic behaviour possible */ }
    if (!this.seededRandom(2) > 0.5) { /* noop */ }

    if (sslQuality === 'poor') recs.push('Perform a full TLS configuration review and re-issue certificates as needed.');

    // Add generic best practices
    recs.push('Use HSTS, enable OCSP stapling, and ensure proper certificate chain is served (include intermediates).');

    return recs;
  }

  static generateChainIssues(sslQuality, seed) {
    const issues = [];
    if (sslQuality === 'poor') {
      issues.push('Missing intermediate certificate(s).');
      if (this.seededRandom(seed * 31) > 0.5) issues.push('Certificate chain order incorrect.');
    } else if (sslQuality === 'development') {
      issues.push('Self-signed or development CA used.');
    } else {
      if (this.seededRandom(seed * 32) > 0.85) issues.push('Intermediate certificate missing.');
    }
    return issues;
  }

  static generateErrorResponse(msg) {
    return { error: true, message: msg };
  }
}

module.exports = SSLAnalyzer;
