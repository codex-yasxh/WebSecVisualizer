const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const SecurityScanner = require('../services/SecurityScanner');
const { validateUrl } = require('../utils/validators');

// In-memory storage for scan results (in production, use a database)
const scanResults = new Map();

// Start a new security scan
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url || !validateUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid URL (e.g., https://example.com)'
      });
    }

    // Generate unique scan ID
    const scanId = uuidv4();
    
    // Initialize scan result
    const scanResult = {
      id: scanId,
      url: url,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      results: {
        malware: null,
        ssl: null,
        headers: null,
        tech: null,
        ports: null,
        whois: null,
        riskScore: null,
        recommendations: []
      },
      errors: []
    };

    // Store scan result
    scanResults.set(scanId, scanResult);

    // Start security scan in background
    SecurityScanner.startScan(scanId, url, scanResults);

    res.status(201).json({
      message: 'Security scan started successfully',
      scanId: scanId,
      status: 'pending',
      estimatedTime: '30-60 seconds'
    });

  } catch (error) {
    console.error('Error starting scan:', error);
    res.status(500).json({
      error: 'Failed to start security scan',
      message: error.message
    });
  }
});

// Get scan status and results
router.get('/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    if (!scanResults.has(scanId)) {
      return res.status(404).json({
        error: 'Scan not found',
        message: 'The specified scan ID does not exist'
      });
    }

    const scanResult = scanResults.get(scanId);
    
    res.json({
      scanId: scanResult.id,
      url: scanResult.url,
      status: scanResult.status,
      progress: scanResult.progress,
      startTime: scanResult.startTime,
      endTime: scanResult.endTime,
      results: scanResult.results,
      errors: scanResult.errors,
      riskLevel: calculateRiskLevel(scanResult.results),
      summary: generateSummary(scanResult.results)
    });

  } catch (error) {
    console.error('Error retrieving scan:', error);
    res.status(500).json({
      error: 'Failed to retrieve scan results',
      message: error.message
    });
  }
});

// Get scan status only
router.get('/:scanId/status', async (req, res) => {
  try {
    const { scanId } = req.params;

    if (!scanResults.has(scanId)) {
      return res.status(404).json({
        error: 'Scan not found',
        message: 'The specified scan ID does not exist'
      });
    }

    const scanResult = scanResults.get(scanId);
    
    res.json({
      scanId: scanResult.id,
      status: scanResult.status,
      progress: scanResult.progress,
      startTime: scanResult.startTime,
      endTime: scanResult.endTime
    });

  } catch (error) {
    console.error('Error retrieving scan status:', error);
    res.status(500).json({
      error: 'Failed to retrieve scan status',
      message: error.message
    });
  }
});

// Get recent scans (for demo purposes)
router.get('/', async (req, res) => {
  try {
    const recentScans = Array.from(scanResults.values())
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 10)
      .map(scan => ({
        id: scan.id,
        url: scan.url,
        status: scan.status,
        progress: scan.progress,
        startTime: scan.startTime,
        endTime: scan.endTime,
        riskLevel: calculateRiskLevel(scan.results)
      }));

    res.json({
      scans: recentScans,
      total: scanResults.size
    });

  } catch (error) {
    console.error('Error retrieving recent scans:', error);
    res.status(500).json({
      error: 'Failed to retrieve recent scans',
      message: error.message
    });
  }
});

// Helper function to calculate risk level
function calculateRiskLevel(results) {
  if (!results || Object.values(results).every(r => r === null)) {
    return 'unknown';
  }

  let score = 0;
  let totalChecks = 0;

  // SSL/TLS Score
  if (results.ssl) {
    totalChecks++;
    if (results.ssl.grade === 'A' || results.ssl.grade === 'A+') {
      score += 10;
    } else if (results.ssl.grade === 'B') {
      score += 7;
    } else if (results.ssl.grade === 'C') {
      score += 4;
    } else {
      score += 1;
    }
  }

  // Security Headers Score
  if (results.headers) {
    totalChecks++;
    const headerScore = results.headers.score || 0;
    score += (headerScore / 100) * 10;
  }

  // Malware Score
  if (results.malware) {
    totalChecks++;
    if (results.malware.malicious === 0) {
      score += 10;
    } else if (results.malware.malicious < 5) {
      score += 7;
    } else if (results.malware.malicious < 10) {
      score += 4;
    } else {
      score += 1;
    }
  }

  // Port Scan Score
  if (results.ports) {
    totalChecks++;
    const openPorts = results.ports.openPorts || [];
    const riskyPorts = openPorts.filter(port => [21, 23, 25, 53, 80, 110, 143, 993, 995].includes(port));
    if (riskyPorts.length === 0) {
      score += 10;
    } else if (riskyPorts.length < 3) {
      score += 7;
    } else {
      score += 4;
    }
  }

  if (totalChecks === 0) return 'unknown';

  const averageScore = score / totalChecks;

  if (averageScore >= 8) return 'low';
  if (averageScore >= 5) return 'medium';
  return 'high';
}

// Helper function to generate summary
function generateSummary(results) {
  const summary = {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    warnings: 0
  };

  if (results.ssl) {
    summary.totalChecks++;
    if (results.ssl.grade === 'A' || results.ssl.grade === 'A+') {
      summary.passedChecks++;
    } else {
      summary.failedChecks++;
    }
  }

  if (results.headers) {
    summary.totalChecks++;
    const headerScore = results.headers.score || 0;
    if (headerScore >= 80) {
      summary.passedChecks++;
    } else if (headerScore >= 60) {
      summary.warnings++;
    } else {
      summary.failedChecks++;
    }
  }

  if (results.malware) {
    summary.totalChecks++;
    if (results.malware.malicious === 0) {
      summary.passedChecks++;
    } else {
      summary.failedChecks++;
    }
  }

  if (results.ports) {
    summary.totalChecks++;
    const openPorts = results.ports.openPorts || [];
    const riskyPorts = openPorts.filter(port => [21, 23, 25, 53, 80, 110, 143, 993, 995].includes(port));
    if (riskyPorts.length === 0) {
      summary.passedChecks++;
    } else {
      summary.warnings++;
    }
  }

  return summary;
}

module.exports = router; 