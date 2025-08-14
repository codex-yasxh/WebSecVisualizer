const https = require('https');
const http = require('http');
const { URL } = require('url');

class TechAnalyzer {
  static async analyze(domain) {
    try {
      console.log(`🔧 Analyzing technology stack for ${domain}`);
      
      const result = {
        technologies: [],
        categories: {},
        score: 0,
        recommendations: [],
        details: {}
      };

      // Get HTML content
      const html = await this.getHtmlContent(domain);
      if (!html) {
        result.error = 'Could not retrieve website content';
        return result;
      }

      // Analyze technologies from HTML
      const techAnalysis = this.analyzeHtml(html);
      result.technologies = techAnalysis.technologies;
      result.categories = techAnalysis.categories;
      result.details = techAnalysis.details;

      // Calculate security score based on technologies
      result.score = this.calculateSecurityScore(techAnalysis.technologies);
      result.recommendations = this.generateRecommendations(techAnalysis.technologies);

      console.log(`✅ Technology analysis completed for ${domain} - Found ${result.technologies.length} technologies`);
      
      return result;

    } catch (error) {
      console.error(`❌ Technology analysis failed for ${domain}:`, error.message);
      return {
        error: error.message,
        technologies: [],
        categories: {},
        score: 0,
        recommendations: ['Check website accessibility'],
        details: {}
      };
    }
  }

  static async getHtmlContent(domain) {
    return new Promise((resolve) => {
      // Try HTTPS first
      const tryHttps = () => {
        const req = https.request({
          hostname: domain,
          port: 443,
          method: 'GET',
          path: '/',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(data);
          });
        });

        req.on('error', () => {
          // Try HTTP if HTTPS fails
          tryHttp();
        });

        req.on('timeout', () => {
          req.destroy();
          tryHttp();
        });

        req.end();
      };

      const tryHttp = () => {
        const req = http.request({
          hostname: domain,
          port: 80,
          method: 'GET',
          path: '/',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(data);
          });
        });

        req.on('error', () => {
          resolve(null);
        });

        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });

        req.end();
      };

      tryHttps();
    });
  }

  static analyzeHtml(html) {
    const technologies = [];
    const categories = {};
    const details = {};

    // Technology signatures
    const signatures = {
      // Web Frameworks
      'React': {
        patterns: [
          /react\.js/i,
          /react-dom\.js/i,
          /__react__/i,
          /data-reactroot/i
        ],
        category: 'JavaScript Framework',
        risk: 'low'
      },
      'Vue.js': {
        patterns: [
          /vue\.js/i,
          /vue\.min\.js/i,
          /v-data-/i,
          /v-if/i,
          /v-for/i
        ],
        category: 'JavaScript Framework',
        risk: 'low'
      },
      'Angular': {
        patterns: [
          /angular\.js/i,
          /angular\.min\.js/i,
          /ng-/i,
          /data-ng-/i
        ],
        category: 'JavaScript Framework',
        risk: 'low'
      },
      'jQuery': {
        patterns: [
          /jquery\.js/i,
          /jquery\.min\.js/i,
          /\$\(/i,
          /jquery\./i
        ],
        category: 'JavaScript Library',
        risk: 'medium'
      },

      // Server Technologies
      'PHP': {
        patterns: [
          /\.php/i,
          /php/i,
          /x-powered-by.*php/i
        ],
        category: 'Server Technology',
        risk: 'medium'
      },
      'ASP.NET': {
        patterns: [
          /\.aspx/i,
          /asp\.net/i,
          /x-powered-by.*asp/i
        ],
        category: 'Server Technology',
        risk: 'low'
      },
      'Node.js': {
        patterns: [
          /x-powered-by.*express/i,
          /x-powered-by.*node/i,
          /express\.js/i
        ],
        category: 'Server Technology',
        risk: 'low'
      },

      // Web Servers
      'Apache': {
        patterns: [
          /server.*apache/i,
          /x-powered-by.*apache/i
        ],
        category: 'Web Server',
        risk: 'low'
      },
      'Nginx': {
        patterns: [
          /server.*nginx/i,
          /x-powered-by.*nginx/i
        ],
        category: 'Web Server',
        risk: 'low'
      },
      'IIS': {
        patterns: [
          /server.*iis/i,
          /x-powered-by.*iis/i
        ],
        category: 'Web Server',
        risk: 'low'
      },

      // CMS
      'WordPress': {
        patterns: [
          /wp-content/i,
          /wp-includes/i,
          /wordpress/i,
          /wp-admin/i
        ],
        category: 'CMS',
        risk: 'medium'
      },
      'Drupal': {
        patterns: [
          /drupal/i,
          /sites\/default/i
        ],
        category: 'CMS',
        risk: 'medium'
      },
      'Joomla': {
        patterns: [
          /joomla/i,
          /components\/com_/i
        ],
        category: 'CMS',
        risk: 'medium'
      },

      // Analytics & Tracking
      'Google Analytics': {
        patterns: [
          /google-analytics/i,
          /gtag/i,
          /ga\(/i,
          /googletagmanager/i
        ],
        category: 'Analytics',
        risk: 'low'
      },
      'Facebook Pixel': {
        patterns: [
          /facebook\.com\/tr/i,
          /fbevents\.js/i
        ],
        category: 'Analytics',
        risk: 'low'
      },

      // Security
      'Cloudflare': {
        patterns: [
          /cloudflare/i,
          /__cfduid/i
        ],
        category: 'Security',
        risk: 'low'
      },
      'reCAPTCHA': {
        patterns: [
          /recaptcha/i,
          /g-recaptcha/i
        ],
        category: 'Security',
        risk: 'low'
      },

      // UI Frameworks
      'Bootstrap': {
        patterns: [
          /bootstrap\.css/i,
          /bootstrap\.js/i,
          /bootstrap\.min/i
        ],
        category: 'UI Framework',
        risk: 'low'
      },
      'Material-UI': {
        patterns: [
          /material-ui/i,
          /@material-ui/i
        ],
        category: 'UI Framework',
        risk: 'low'
      },

      // Database
      'MySQL': {
        patterns: [
          /mysql/i,
          /mysqli/i
        ],
        category: 'Database',
        risk: 'medium'
      },
      'PostgreSQL': {
        patterns: [
          /postgresql/i,
          /postgres/i
        ],
        category: 'Database',
        risk: 'medium'
      },

      // Payment
      'Stripe': {
        patterns: [
          /stripe\.com/i,
          /stripe\.js/i
        ],
        category: 'Payment',
        risk: 'low'
      },
      'PayPal': {
        patterns: [
          /paypal\.com/i,
          /paypalobjects/i
        ],
        category: 'Payment',
        risk: 'low'
      }
    };

    // Check for each technology
    for (const [techName, techInfo] of Object.entries(signatures)) {
      for (const pattern of techInfo.patterns) {
        if (pattern.test(html)) {
          const technology = {
            name: techName,
            category: techInfo.category,
            risk: techInfo.risk,
            outdated: this.checkIfOutdated(techName, html),
            confidence: this.calculateConfidence(pattern, html)
          };

          // Avoid duplicates
          if (!technologies.find(t => t.name === techName)) {
            technologies.push(technology);
          }

          // Group by category
          if (!categories[techInfo.category]) {
            categories[techInfo.category] = [];
          }
          if (!categories[techInfo.category].find(t => t.name === techName)) {
            categories[techInfo.category].push(technology);
          }

          break; // Found this technology, move to next
        }
      }
    }

    // Additional analysis
    details.totalTechnologies = technologies.length;
    details.categories = Object.keys(categories);
    details.outdatedCount = technologies.filter(t => t.outdated).length;
    details.highRiskCount = technologies.filter(t => t.risk === 'high').length;

    return { technologies, categories, details };
  }

  static checkIfOutdated(techName, html) {
    const outdatedPatterns = {
      'jQuery': [
        /jquery-1\./i,
        /jquery-2\./i
      ],
      'PHP': [
        /php\/5\./i,
        /php\/4\./i
      ],
      'WordPress': [
        /wp-content\/themes\/twenty/i
      ]
    };

    const patterns = outdatedPatterns[techName];
    if (patterns) {
      return patterns.some(pattern => pattern.test(html));
    }

    return false;
  }

  static calculateConfidence(pattern, html) {
    const matches = html.match(pattern);
    if (!matches) return 0;
    
    // Higher confidence if pattern appears multiple times
    return Math.min(100, matches.length * 25);
  }

  static calculateSecurityScore(technologies) {
    let score = 100;
    let totalTech = technologies.length;

    if (totalTech === 0) return 50; // Neutral score for unknown

    for (const tech of technologies) {
      switch (tech.risk) {
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

      if (tech.outdated) {
        score -= 15;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  static generateRecommendations(technologies) {
    const recommendations = [];

    const outdatedTech = technologies.filter(t => t.outdated);
    if (outdatedTech.length > 0) {
      recommendations.push(`Update ${outdatedTech.length} outdated technology(ies) to latest versions`);
    }

    const highRiskTech = technologies.filter(t => t.risk === 'high');
    if (highRiskTech.length > 0) {
      recommendations.push(`Review security implications of ${highRiskTech.length} high-risk technology(ies)`);
    }

    const cmsTech = technologies.filter(t => t.category === 'CMS');
    if (cmsTech.length > 0) {
      recommendations.push('Keep CMS and plugins updated to prevent vulnerabilities');
    }

    const hasAnalytics = technologies.some(t => t.category === 'Analytics');
    if (hasAnalytics) {
      recommendations.push('Review privacy policy for analytics and tracking technologies');
    }

    const hasPayment = technologies.some(t => t.category === 'Payment');
    if (hasPayment) {
      recommendations.push('Ensure PCI DSS compliance for payment processing');
    }

    return recommendations;
  }
}

module.exports = TechAnalyzer; 