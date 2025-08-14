import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Globe } from 'lucide-react';

const UrlInput = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (inputUrl) => {
    if (!inputUrl.trim()) {
      return 'Please enter a URL';
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(inputUrl)) {
      return 'Please enter a valid URL starting with http:// or https://';
    }

    try {
      new URL(inputUrl);
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onSubmit(url);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Enter Website URL</h2>
        <p className="text-dark-400">
          Scan any website for security vulnerabilities and misconfigurations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-dark-400" />
          </div>
          
          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com"
            className={`input pl-10 pr-4 py-3 text-lg ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            disabled={isLoading}
          />
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || !url.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full btn-primary py-3 text-lg font-semibold ${
            isLoading || !url.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span>Starting Scan...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Start Security Scan</span>
            </div>
          )}
        </motion.button>
      </form>

      {/* Example URLs */}
      <div className="text-center">
        <p className="text-dark-400 text-sm mb-2">Try scanning these example websites:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['https://google.com', 'https://github.com', 'https://stackoverflow.com'].map((exampleUrl) => (
            <button
              key={exampleUrl}
              onClick={() => setUrl(exampleUrl)}
              className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-500/30 hover:bg-blue-500/10 transition-all duration-200"
            >
              {exampleUrl.replace('https://', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Search className="w-3 h-3 text-blue-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">Security Notice</h4>
            <p className="text-sm text-dark-300">
              This tool performs non-intrusive security scans. We do not store or share your scan results. 
              All analysis is performed in real-time and results are not persisted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlInput; 