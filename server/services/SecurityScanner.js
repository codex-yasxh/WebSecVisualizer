const SSLAnalyzer = require('./SSLAnalyzer');
const HeadersAnalyzer = require('./HeadersAnalyzer');
const TechAnalyzer = require('./TechAnalyzer');
const MalwareAnalyzer = require('./MalwareAnalyzer');
const PortAnalyzer = require('./PortAnalyzer');
const WhoisAnalyzer = require('./WhoisAnalyzer');
const { extractDomain } = require('../utils/validators');

class SecurityScanner {
  static async startScan(scanId, url, scanResults) {
    try {
      const domain = extractDomain(url);
      const scanResult = scanResults.get(scanId);
      
      if (!scanResult) {
        throw new Error('Scan result not found');
      }

      // Update status to scanning
      scanResult.status = 'scanning';
      scanResult.progress = 0;
      scanResults.set(scanId, scanResult);

      console.log(`🔍 Starting security scan for ${url} (ID: ${scanId})`);

      // Define scan steps
      const scanSteps = [
        { name: 'malware', weight: 20, analyzer: () => MalwareAnalyzer.analyze(url) },
        { name: 'ssl', weight: 20, analyzer: () => SSLAnalyzer.analyze(domain) },
        { name: 'headers', weight: 20, analyzer: () => HeadersAnalyzer.analyze(domain) },
        { name: 'tech', weight: 15, analyzer: () => TechAnalyzer.analyze(domain) },
        { name: 'ports', weight: 15, analyzer: () => PortAnalyzer.analyze(domain) },
        { name: 'whois', weight: 10, analyzer: () => WhoisAnalyzer.analyze(domain) }
      ];

      let completedWeight = 0;
      const totalWeight = scanSteps.reduce((sum, step) => sum + step.weight, 0);

      // Execute scan steps
      for (const step of scanSteps) {
        try {
          console.log(`📊 Running ${step.name} analysis for ${domain}`);
          
          const result = await step.analyzer();
          scanResult.results[step.name] = result;
          
          completedWeight += step.weight;
          scanResult.progress = Math.round((completedWeight / totalWeight) * 100);
          
          console.log(`✅ ${step.name} analysis completed (${scanResult.progress}%)`);
          
        } catch (error) {
          console.error(`❌ ${step.name} analysis failed:`, error.message);
          scanResult.errors.push({
            step: step.name,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          
          // Continue with other steps even if one fails
          completedWeight += step.weight;
          scanResult.progress = Math.round((completedWeight / totalWeight) * 100);
        }

        // Update scan result
        scanResults.set(scanId, scanResult);
        
        // Small delay to prevent overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate risk score and generate recommendations
      scanResult.results.riskScore = this.calculateRiskScore(scanResult.results);
      scanResult.results.recommendations = this.generateRecommendations(scanResult.results);

      // Mark scan as completed
      scanResult.status = 'completed';
      scanResult.progress = 100;
      scanResult.endTime = new Date().toISOString();

      scanResults.set(scanId, scanResult);

      console.log(`🎉 Security scan completed for ${url} (ID: ${scanId})`);
      console.log(`📈 Risk Level: ${this.getRiskLevel(scanResult.results.riskScore)}`);

    } catch (error) {
      console.error(`💥 Security scan failed for ${url} (ID: ${scanId}):`, error);
      
      const scanResult = scanResults.get(scanId);
      if (scanResult) {
        scanResult.status = 'failed';
        scanResult.errors.push({
          step: 'general',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        scanResults.set(scanId, scanResult);
      }
    }
  }

  static calculateRiskScore(results) {
    let score = 0;
    let maxScore = 0;

    // SSL/TLS Score (0-100)
    if (results.ssl) {
      maxScore += 100;
      const sslGrade = results.ssl.grade;
      if (sslGrade === 'A+' || sslGrade === 'A') {
        score += 100;
      } else if (sslGrade === 'B') {
        score += 75;
      } else if (sslGrade === 'C') {
        score += 50;
      } else if (sslGrade === 'D') {
        score += 25;
      } else if (sslGrade === 'E' || sslGrade === 'F') {
        score += 0;
      } else {
        score += 0; // No SSL
      }
    }

    // Security Headers Score (0-100)
    if (results.headers) {
      maxScore += 100;
      score += results.headers.score || 0;
    }

    // Malware Score (0-100)
    if (results.malware) {
      maxScore += 100;
      const maliciousCount = results.malware.malicious || 0;
      const totalCount = results.malware.total || 1;
      const malwarePercentage = (maliciousCount / totalCount) * 100;
      score += Math.max(0, 100 - malwarePercentage);
    }

    // Port Security Score (0-100)
    if (results.ports) {
      maxScore += 100;
      const openPorts = results.ports.openPorts || [];
      const riskyPorts = openPorts.filter(port => [21, 23, 25, 53, 80, 110, 143, 993, 995].includes(port));
      const portScore = Math.max(0, 100 - (riskyPorts.length * 20));
      score += portScore;
    }

    // Technology Stack Score (0-100)
    if (results.tech) {
      maxScore += 100;
      const technologies = results.tech.technologies || [];
      const outdatedTech = technologies.filter(tech => tech.outdated);
      const techScore = Math.max(0, 100 - (outdatedTech.length * 10));
      score += techScore;
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  static getRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  static generateRecommendations(results) {
    const recommendations = [];

    // SSL/TLS Recommendations
    if (results.ssl) {
      if (results.ssl.grade === 'F' || results.ssl.grade === 'E') {
        recommendations.push({
          category: 'SSL/TLS',
          priority: 'high',
          title: 'Upgrade SSL/TLS Configuration',
          description: 'Your SSL/TLS configuration is weak. Consider upgrading to stronger protocols and ciphers.',
          action: 'Configure TLS 1.2+ and remove weak ciphers'
        });
      } else if (results.ssl.grade === 'D' || results.ssl.grade === 'C') {
        recommendations.push({
          category: 'SSL/TLS',
          priority: 'medium',
          title: 'Improve SSL/TLS Security',
          description: 'Your SSL/TLS configuration can be improved for better security.',
          action: 'Review and update SSL/TLS settings'
        });
      }
    }

    // Security Headers Recommendations
    if (results.headers) {
      const missingHeaders = results.headers.missingHeaders || [];
      
      if (missingHeaders.includes('Content-Security-Policy')) {
        recommendations.push({
          category: 'Security Headers',
          priority: 'high',
          title: 'Add Content Security Policy',
          description: 'CSP helps prevent XSS attacks by controlling resource loading.',
          action: 'Implement Content-Security-Policy header'
        });
      }

      if (missingHeaders.includes('X-Frame-Options')) {
        recommendations.push({
          category: 'Security Headers',
          priority: 'medium',
          title: 'Add X-Frame-Options',
          description: 'Prevents clickjacking attacks.',
          action: 'Add X-Frame-Options: DENY or SAMEORIGIN'
        });
      }

      if (missingHeaders.includes('X-Content-Type-Options')) {
        recommendations.push({
          category: 'Security Headers',
          priority: 'medium',
          title: 'Add X-Content-Type-Options',
          description: 'Prevents MIME type sniffing.',
          action: 'Add X-Content-Type-Options: nosniff'
        });
      }

      if (missingHeaders.includes('Strict-Transport-Security')) {
        recommendations.push({
          category: 'Security Headers',
          priority: 'high',
          title: 'Add HSTS Header',
          description: 'Forces HTTPS connections and prevents protocol downgrade attacks.',
          action: 'Add Strict-Transport-Security header'
        });
      }
    }

    // Malware Recommendations
    if (results.malware && results.malware.malicious > 0) {
      recommendations.push({
        category: 'Malware',
        priority: 'critical',
        title: 'Malware Detected',
        description: `${results.malware.malicious} security vendors flagged this URL as malicious.`,
        action: 'Investigate and clean the website immediately'
      });
    }

    // Port Security Recommendations
    if (results.ports) {
      const openPorts = results.ports.openPorts || [];
      const riskyPorts = openPorts.filter(port => [21, 23, 25, 53, 80, 110, 143, 993, 995].includes(port));
      
      if (riskyPorts.length > 0) {
        recommendations.push({
          category: 'Network Security',
          priority: 'medium',
          title: 'Close Unnecessary Ports',
          description: `Found ${riskyPorts.length} potentially risky open ports: ${riskyPorts.join(', ')}`,
          action: 'Review and close unnecessary ports'
        });
      }
    }

    // Technology Stack Recommendations
    if (results.tech) {
      const outdatedTech = results.tech.technologies?.filter(tech => tech.outdated) || [];
      
      if (outdatedTech.length > 0) {
        recommendations.push({
          category: 'Technology Stack',
          priority: 'medium',
          title: 'Update Outdated Technologies',
          description: `Found ${outdatedTech.length} outdated technologies that may have security vulnerabilities.`,
          action: 'Update to latest versions of identified technologies'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

module.exports = SecurityScanner; 