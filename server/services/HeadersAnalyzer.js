const https = require('https');
const http = require('http');
const { URL } = require('url');

class HeadersAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🛡️ Analyzing security headers for ${domain}`);
      
      const result = {
        score: 0,
        headers: {},
        missingHeaders: [],
        presentHeaders: [],
        recommendations: [],
        details: {}
      };

      // Check both HTTP and HTTPS
      const httpHeaders = await this.checkHeaders(domain, false);
      const httpsHeaders = await this.checkHeaders(domain, true);

      // Use HTTPS headers if available, otherwise HTTP
      const headers = httpsHeaders || httpHeaders;

      if (!headers) {
        result.score = 0;
        result.missingHeaders = this.getRequiredHeaders();
        result.recommendations.push('Enable HTTPS for better security');
        return result;
      }

      result.headers = headers;
      result.presentHeaders = Object.keys(headers);

      // Analyze each security header
      const analysis = this.analyzeHeaders(headers);
      result.score = analysis.score;
      result.missingHeaders = analysis.missingHeaders;
      result.details = analysis.details;
      result.recommendations = analysis.recommendations;

      console.log(`✅ Security headers analysis completed for ${domain} - Score: ${result.score}/100`);
      
      return result;

    } catch (error) {
      console.error(`❌ Security headers analysis failed for ${domain}:`, error.message);
      return {
        score: 0,
        error: error.message,
        headers: {},
        missingHeaders: this.getRequiredHeaders(),
        presentHeaders: [],
        recommendations: ['Check server configuration'],
        details: {}
      };
    }
  }

  static async checkHeaders(domain, useHttps = true) {
    return new Promise((resolve) => {
      const protocol = useHttps ? https : http;
      const port = useHttps ? 443 : 80;
      const url = `${useHttps ? 'https' : 'http'}://${domain}`;

      const req = protocol.request({
        hostname: domain,
        port: port,
        method: 'HEAD',
        path: '/',
        timeout: 10000,
        headers: {
          'User-Agent': 'WebSec-Visualizer/1.0'
        }
      }, (res) => {
        const headers = res.headers;
        resolve(headers);
      });

      req.on('error', () => {
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    });
  }

  static getRequiredHeaders() {
    return [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Permissions-Policy'
    ];
  }

  static analyzeHeaders(headers) {
    const analysis = {
      score: 0,
      missingHeaders: [],
      details: {},
      recommendations: []
    };

    const requiredHeaders = this.getRequiredHeaders();
    const presentHeaders = Object.keys(headers).map(h => h.toLowerCase());

    // Check each required header
    for (const header of requiredHeaders) {
      const headerLower = header.toLowerCase();
      const headerValue = headers[headerLower] || headers[header];

      if (!headerValue) {
        analysis.missingHeaders.push(header);
        continue;
      }

      // Analyze specific headers
      const headerAnalysis = this.analyzeSpecificHeader(header, headerValue);
      analysis.details[header] = headerAnalysis;
      analysis.score += headerAnalysis.score;
    }

    // Additional checks for other security headers
    const additionalHeaders = [
      'X-Permitted-Cross-Domain-Policies',
      'Cross-Origin-Embedder-Policy',
      'Cross-Origin-Opener-Policy',
      'Cross-Origin-Resource-Policy'
    ];

    for (const header of additionalHeaders) {
      const headerLower = header.toLowerCase();
      const headerValue = headers[headerLower] || headers[header];

      if (headerValue) {
        const headerAnalysis = this.analyzeSpecificHeader(header, headerValue);
        analysis.details[header] = headerAnalysis;
        analysis.score += headerAnalysis.score;
      }
    }

    // Generate recommendations based on missing headers
    analysis.recommendations = this.generateRecommendations(analysis.missingHeaders, analysis.details);

    // Normalize score to 0-100
    analysis.score = Math.min(100, Math.max(0, analysis.score));

    return analysis;
  }

  static analyzeSpecificHeader(headerName, headerValue) {
    const analysis = {
      present: true,
      value: headerValue,
      score: 0,
      issues: [],
      recommendations: []
    };

    switch (headerName) {
      case 'Content-Security-Policy':
        analysis.score = this.analyzeCSP(headerValue, analysis);
        break;

      case 'X-Frame-Options':
        analysis.score = this.analyzeXFrameOptions(headerValue, analysis);
        break;

      case 'X-Content-Type-Options':
        analysis.score = this.analyzeXContentTypeOptions(headerValue, analysis);
        break;

      case 'Strict-Transport-Security':
        analysis.score = this.analyzeHSTS(headerValue, analysis);
        break;

      case 'X-XSS-Protection':
        analysis.score = this.analyzeXXSSProtection(headerValue, analysis);
        break;

      case 'Referrer-Policy':
        analysis.score = this.analyzeReferrerPolicy(headerValue, analysis);
        break;

      case 'Permissions-Policy':
        analysis.score = this.analyzePermissionsPolicy(headerValue, analysis);
        break;

      default:
        // Generic analysis for other headers
        analysis.score = 10; // Base score for having the header
        break;
    }

    return analysis;
  }

  static analyzeCSP(value, analysis) {
    let score = 20; // Base score for having CSP

    // Check for essential directives
    const essentialDirectives = ['default-src', 'script-src', 'style-src'];
    const presentDirectives = essentialDirectives.filter(dir => 
      value.toLowerCase().includes(dir.toLowerCase())
    );

    score += presentDirectives.length * 5;

    // Check for unsafe-inline
    if (value.toLowerCase().includes('unsafe-inline')) {
      score -= 5;
      analysis.issues.push('CSP contains unsafe-inline');
      analysis.recommendations.push('Avoid unsafe-inline in CSP');
    }

    // Check for unsafe-eval
    if (value.toLowerCase().includes('unsafe-eval')) {
      score -= 5;
      analysis.issues.push('CSP contains unsafe-eval');
      analysis.recommendations.push('Avoid unsafe-eval in CSP');
    }

    return Math.max(0, score);
  }

  static analyzeXFrameOptions(value, analysis) {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue.includes('deny')) {
      return 20; // Best practice
    } else if (lowerValue.includes('sameorigin')) {
      return 15; // Good practice
    } else {
      analysis.issues.push('X-Frame-Options should be DENY or SAMEORIGIN');
      analysis.recommendations.push('Set X-Frame-Options to DENY or SAMEORIGIN');
      return 5;
    }
  }

  static analyzeXContentTypeOptions(value, analysis) {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue.includes('nosniff')) {
      return 15;
    } else {
      analysis.issues.push('X-Content-Type-Options should be nosniff');
      analysis.recommendations.push('Set X-Content-Type-Options to nosniff');
      return 5;
    }
  }

  static analyzeHSTS(value, analysis) {
    let score = 15; // Base score for having HSTS
    
    // Check for max-age
    const maxAgeMatch = value.match(/max-age=(\d+)/i);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1]);
      if (maxAge >= 31536000) { // 1 year
        score += 5;
      } else if (maxAge >= 86400) { // 1 day
        score += 3;
      } else {
        analysis.issues.push('HSTS max-age should be at least 1 day');
        analysis.recommendations.push('Increase HSTS max-age to at least 1 day');
      }
    } else {
      analysis.issues.push('HSTS missing max-age directive');
      analysis.recommendations.push('Add max-age directive to HSTS');
      score -= 5;
    }

    // Check for includeSubDomains
    if (value.toLowerCase().includes('includesubdomains')) {
      score += 3;
    } else {
      analysis.recommendations.push('Consider adding includeSubDomains to HSTS');
    }

    // Check for preload
    if (value.toLowerCase().includes('preload')) {
      score += 2;
    }

    return Math.max(0, score);
  }

  static analyzeXXSSProtection(value, analysis) {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue.includes('1; mode=block')) {
      return 10;
    } else if (lowerValue.includes('1')) {
      return 8;
    } else {
      analysis.issues.push('X-XSS-Protection should be enabled');
      analysis.recommendations.push('Set X-XSS-Protection to 1; mode=block');
      return 2;
    }
  }

  static analyzeReferrerPolicy(value, analysis) {
    const lowerValue = value.toLowerCase();
    const goodPolicies = ['no-referrer', 'strict-origin', 'strict-origin-when-cross-origin'];
    
    if (goodPolicies.some(policy => lowerValue.includes(policy))) {
      return 10;
    } else {
      analysis.issues.push('Referrer-Policy should use a strict policy');
      analysis.recommendations.push('Use strict-origin or no-referrer for Referrer-Policy');
      return 5;
    }
  }

  static analyzePermissionsPolicy(value, analysis) {
    // Basic check for Permissions-Policy
    if (value && value.length > 0) {
      return 10;
    } else {
      analysis.issues.push('Permissions-Policy is empty or invalid');
      analysis.recommendations.push('Configure Permissions-Policy with appropriate restrictions');
      return 2;
    }
  }

  static generateRecommendations(missingHeaders, details) {
    const recommendations = [];

    // Add recommendations for missing headers
    for (const header of missingHeaders) {
      switch (header) {
        case 'Content-Security-Policy':
          recommendations.push('Add Content-Security-Policy header to prevent XSS attacks');
          break;
        case 'X-Frame-Options':
          recommendations.push('Add X-Frame-Options header to prevent clickjacking');
          break;
        case 'X-Content-Type-Options':
          recommendations.push('Add X-Content-Type-Options: nosniff to prevent MIME sniffing');
          break;
        case 'Strict-Transport-Security':
          recommendations.push('Add Strict-Transport-Security header to enforce HTTPS');
          break;
        case 'X-XSS-Protection':
          recommendations.push('Add X-XSS-Protection header for additional XSS protection');
          break;
        case 'Referrer-Policy':
          recommendations.push('Add Referrer-Policy header to control referrer information');
          break;
        case 'Permissions-Policy':
          recommendations.push('Add Permissions-Policy header to control browser features');
          break;
      }
    }

    // Add recommendations from header analysis
    for (const [header, analysis] of Object.entries(details)) {
      if (analysis.recommendations) {
        recommendations.push(...analysis.recommendations);
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

module.exports = HeadersAnalyzer; 