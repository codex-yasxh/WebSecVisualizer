const express = require('express');
const router = express.Router();

const SSLAnalyzer = require('../services/SSLAnalyzer');
const HeadersAnalyzer = require('../services/HeadersAnalyzer');
const TechAnalyzer = require('../services/TechAnalyzer');
const MalwareAnalyzer = require('../services/MalwareAnalyzer');
const PortAnalyzer = require('../services/PortAnalyzer');
const WhoisAnalyzer = require('../services/WhoisAnalyzer');
const { validateUrl, extractDomain } = require('../utils/validators');

// SSL/TLS Analysis
router.get('/ssl/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const cleanDomain = extractDomain(domain);

    if (!cleanDomain) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain name'
      });
    }

    const sslResult = await SSLAnalyzer.analyze(cleanDomain);
    
    res.json({
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      ...sslResult
    });

  } catch (error) {
    console.error('SSL Analysis Error:', error);
    res.status(500).json({
      error: 'SSL analysis failed',
      message: error.message
    });
  }
});

// Security Headers Analysis
router.get('/headers/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const cleanDomain = extractDomain(domain);

    if (!cleanDomain) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain name'
      });
    }

    const headersResult = await HeadersAnalyzer.analyze(cleanDomain);
    
    res.json({
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      ...headersResult
    });

  } catch (error) {
    console.error('Headers Analysis Error:', error);
    res.status(500).json({
      error: 'Security headers analysis failed',
      message: error.message
    });
  }
});

// Technology Stack Analysis
router.get('/tech/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const cleanDomain = extractDomain(domain);

    if (!cleanDomain) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain name'
      });
    }

    const techResult = await TechAnalyzer.analyze(cleanDomain);
    
    res.json({
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      ...techResult
    });

  } catch (error) {
    console.error('Tech Analysis Error:', error);
    res.status(500).json({
      error: 'Technology analysis failed',
      message: error.message
    });
  }
});

// Malware Detection
router.get('/malware/:url', async (req, res) => {
  try {
    const { url } = req.params;
    const decodedUrl = decodeURIComponent(url);

    if (!validateUrl(decodedUrl)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid URL'
      });
    }

    const malwareResult = await MalwareAnalyzer.analyze(decodedUrl);
    
    res.json({
      url: decodedUrl,
      timestamp: new Date().toISOString(),
      ...malwareResult
    });

  } catch (error) {
    console.error('Malware Analysis Error:', error);
    res.status(500).json({
      error: 'Malware analysis failed',
      message: error.message
    });
  }
});

// Port Scan Analysis
router.get('/ports/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const cleanDomain = extractDomain(domain);

    if (!cleanDomain) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain name'
      });
    }

    const portsResult = await PortAnalyzer.analyze(cleanDomain);
    
    res.json({
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      ...portsResult
    });

  } catch (error) {
    console.error('Port Analysis Error:', error);
    res.status(500).json({
      error: 'Port analysis failed',
      message: error.message
    });
  }
});

// WHOIS Information
router.get('/whois/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const cleanDomain = extractDomain(domain);

    if (!cleanDomain) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain name'
      });
    }

    const whoisResult = await WhoisAnalyzer.analyze(cleanDomain);
    
    res.json({
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      ...whoisResult
    });

  } catch (error) {
    console.error('WHOIS Analysis Error:', error);
    res.status(500).json({
      error: 'WHOIS analysis failed',
      message: error.message
    });
  }
});

// Quick Security Overview
router.get('/overview/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const cleanDomain = extractDomain(domain);

    if (!cleanDomain) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain name'
      });
    }

    // Run quick checks in parallel
    const [sslResult, headersResult, techResult] = await Promise.allSettled([
      SSLAnalyzer.analyze(cleanDomain),
      HeadersAnalyzer.analyze(cleanDomain),
      TechAnalyzer.analyze(cleanDomain)
    ]);

    const overview = {
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      ssl: sslResult.status === 'fulfilled' ? sslResult.value : { error: sslResult.reason?.message },
      headers: headersResult.status === 'fulfilled' ? headersResult.value : { error: headersResult.reason?.message },
      tech: techResult.status === 'fulfilled' ? techResult.value : { error: techResult.reason?.message },
      summary: {
        sslGrade: sslResult.status === 'fulfilled' ? sslResult.value.grade : 'Unknown',
        headerScore: headersResult.status === 'fulfilled' ? headersResult.value.score : 0,
        technologies: techResult.status === 'fulfilled' ? techResult.value.technologies?.length || 0 : 0
      }
    };

    res.json(overview);

  } catch (error) {
    console.error('Overview Analysis Error:', error);
    res.status(500).json({
      error: 'Security overview analysis failed',
      message: error.message
    });
  }
});

module.exports = router; 