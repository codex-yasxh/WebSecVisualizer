// SecurityScanner.js
const SSLAnalyzer = require('./SSLAnalyzer');

// ----------------- MOCK ANALYZERS -----------------
class HeadersAnalyzer {
  async analyze(domain) {
    return {
      headers: {
        'Content-Security-Policy': "default-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
      score: 95,
      recommendations: [
        { message: 'Add X-Frame-Options header to prevent clickjacking', priority: 'medium' }
      ]
    };
  }
}

class TechAnalyzer {
  async analyze(domain) {
    return {
      technologies: ['Node.js', 'Express', 'Nginx'],
      score: 90,
      recommendations: [
        { message: 'Keep Nginx updated to the latest stable release', priority: 'low' }
      ]
    };
  }
}

class MalwareAnalyzer {
  async analyze(url) {
    return {
      scanDate: new Date().toISOString(),
      malicious: false,
      score: 100,
      recommendations: []
    };
  }
}

class PortAnalyzer {
  async analyze(domain) {
    return {
      openPorts: [80, 443],
      score: 85,
      recommendations: [
        { message: 'Close unused ports to reduce attack surface', priority: 'high' }
      ]
    };
  }
}

class WhoisAnalyzer {
  async analyze(domain) {
    return {
      registrar: 'Mock Registrar Inc.',
      creationDate: '2015-01-01',
      expiryDate: '2030-01-01',
      score: 80,
      recommendations: [
        { message: 'Enable WHOIS privacy to protect owner info', priority: 'medium' }
      ]
    };
  }
}

// ----------------- SECURITY SCANNER CORE -----------------
class SecurityScanner {
  constructor() {
    this.progress = 0;
    this.results = {};
    this.scoreWeights = {
      ssl: 0.2,
      headers: 0.2,
      tech: 0.15,
      malware: 0.15,
      ports: 0.15,
      whois: 0.15
    };
  }

  async startScan(url, domain) {
    const steps = [
      { name: 'ssl', analyzer: new SSLAnalyzer().analyze.bind(new SSLAnalyzer()), input: domain },
      { name: 'headers', analyzer: new HeadersAnalyzer().analyze.bind(new HeadersAnalyzer()), input: domain },
      { name: 'tech', analyzer: new TechAnalyzer().analyze.bind(new TechAnalyzer()), input: domain },
      { name: 'malware', analyzer: new MalwareAnalyzer().analyze.bind(new MalwareAnalyzer()), input: url },
      { name: 'ports', analyzer: new PortAnalyzer().analyze.bind(new PortAnalyzer()), input: domain },
      { name: 'whois', analyzer: new WhoisAnalyzer().analyze.bind(new WhoisAnalyzer()), input: domain }
    ];

    for (const step of steps) {
      try {
        this.results[step.name] = await step.analyzer(step.input);
        this.updateProgress(step.name);
      } catch (error) {
        console.error(`❌ ${step.name} analysis failed:`, error);
        this.results[step.name] = { error: error.message, score: 0, recommendations: [] };
      }
    }

    const overallRisk = this.calculateOverallRisk();
    const recommendations = this.compileRecommendations();

    return {
      results: this.results,
      overallRisk,
      recommendations,
      progress: this.progress
    };
  }

  updateProgress(step) {
    const stepWeight = this.scoreWeights[step] || 0;
    this.progress = Math.min(100, this.progress + stepWeight * 100);
    console.log(`Progress: ${this.progress.toFixed(0)}% after ${step}`);
  }

  calculateOverallRisk() {
    let totalScore = 0;
    let totalWeight = 0;
    for (const [step, weight] of Object.entries(this.scoreWeights)) {
      const score = this.results[step]?.score ?? 0;
      totalScore += score * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  compileRecommendations() {
    const recs = [];
    for (const result of Object.values(this.results)) {
      if (result?.recommendations) {
        recs.push(...result.recommendations);
      }
    }
    return recs.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority?.toLowerCase()] ?? 99) -
             (priorityOrder[b.priority?.toLowerCase()] ?? 99);
    });
  }
}

module.exports = SecurityScanner;
