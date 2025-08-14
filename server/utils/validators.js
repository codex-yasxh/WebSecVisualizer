const { URL } = require('url');

/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    // Check if it's a valid URL
    new URL(url);
    
    // Additional validation for common protocols
    const protocol = url.toLowerCase();
    if (!protocol.startsWith('http://') && !protocol.startsWith('https://')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string|null} - The domain or null if invalid
 */
function extractDomain(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const domainMatch = url.match(/^(?:https?:\/\/)?([^\/\?#]+)/i);
    if (domainMatch) {
      return domainMatch[1];
    }
    return null;
  }
}

/**
 * Normalizes URL by adding protocol if missing
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL
 */
function normalizeUrl(url) {
  if (!url) return url;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Validates domain name format
 * @param {string} domain - The domain to validate
 * @returns {boolean} - True if valid domain, false otherwise
 */
function validateDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Basic domain validation regex
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return domainRegex.test(domain);
}

/**
 * Sanitizes URL for safe display
 * @param {string} url - The URL to sanitize
 * @returns {string} - The sanitized URL
 */
function sanitizeUrl(url) {
  if (!url) return url;

  // Remove potentially dangerous characters
  return url.replace(/[<>\"']/g, '');
}

/**
 * Checks if URL is localhost or private IP
 * @param {string} url - The URL to check
 * @returns {boolean} - True if local/private, false otherwise
 */
function isLocalOrPrivateUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check for localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
    
    // Check for private IP ranges
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./
    ];
    
    return privateRanges.some(range => range.test(hostname));
  } catch (error) {
    return false;
  }
}

/**
 * Extracts subdomain from domain
 * @param {string} domain - The domain to extract subdomain from
 * @returns {string|null} - The subdomain or null if no subdomain
 */
function extractSubdomain(domain) {
  if (!domain) return null;

  const parts = domain.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

/**
 * Gets the main domain (without subdomain)
 * @param {string} domain - The domain to get main domain from
 * @returns {string} - The main domain
 */
function getMainDomain(domain) {
  if (!domain) return domain;

  const parts = domain.split('.');
  if (parts.length > 2) {
    return parts.slice(-2).join('.');
  }

  return domain;
}

/**
 * Validates IP address format
 * @param {string} ip - The IP address to validate
 * @returns {boolean} - True if valid IP, false otherwise
 */
function validateIpAddress(ip) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Checks if URL contains suspicious patterns
 * @param {string} url - The URL to check
 * @returns {object} - Object with isSuspicious flag and reasons array
 */
function checkSuspiciousPatterns(url) {
  const result = {
    isSuspicious: false,
    reasons: []
  };

  if (!url) return result;

  const urlLower = url.toLowerCase();

  // Suspicious domain patterns
  const suspiciousDomains = [
    /\.tk$/i,
    /\.ml$/i,
    /\.ga$/i,
    /\.cf$/i,
    /\.gq$/i
  ];

  // Suspicious URL shorteners
  const urlShorteners = [
    /bit\.ly/i,
    /tinyurl\.com/i,
    /goo\.gl/i,
    /t\.co/i,
    /is\.gd/i,
    /v\.gd/i
  ];

  // Suspicious keywords
  const suspiciousKeywords = [
    'login',
    'signin',
    'bank',
    'paypal',
    'secure',
    'update',
    'verify',
    'confirm',
    'account',
    'password'
  ];

  // Check for suspicious domains
  if (suspiciousDomains.some(pattern => pattern.test(url))) {
    result.isSuspicious = true;
    result.reasons.push('Suspicious domain extension');
  }

  // Check for URL shorteners
  if (urlShorteners.some(pattern => pattern.test(url))) {
    result.isSuspicious = true;
    result.reasons.push('URL shortener detected');
  }

  // Check for suspicious keywords
  const foundKeywords = suspiciousKeywords.filter(keyword => 
    urlLower.includes(keyword)
  );
  
  if (foundKeywords.length > 2) {
    result.isSuspicious = true;
    result.reasons.push(`Multiple suspicious keywords: ${foundKeywords.join(', ')}`);
  }

  // Check for excessive subdomains
  try {
    const domain = new URL(url).hostname;
    const subdomainCount = domain.split('.').length - 2;
    if (subdomainCount > 3) {
      result.isSuspicious = true;
      result.reasons.push(`Excessive subdomains (${subdomainCount})`);
    }
  } catch (error) {
    // URL parsing failed, skip this check
  }

  return result;
}

module.exports = {
  validateUrl,
  extractDomain,
  normalizeUrl,
  validateDomain,
  sanitizeUrl,
  isLocalOrPrivateUrl,
  extractSubdomain,
  getMainDomain,
  validateIpAddress,
  checkSuspiciousPatterns
}; 