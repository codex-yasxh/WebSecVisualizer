import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import UrlInput from '../components/UrlInput';
import ScanProgress from '../components/ScanProgress';
import ScanResults from '../components/ScanResults';
import SecurityOverview from '../components/SecurityOverview';
import { useScan } from '../hooks/useScan';

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [scanId, setScanId] = useState(null);
  const { scanData, startScan, isLoading, error } = useScan();

  const handleScanSubmit = async (inputUrl) => {
    try {
      setUrl(inputUrl);
      const result = await startScan(inputUrl);
      setScanId(result.scanId);
      toast.success('Security scan started successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to start scan');
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-security-low';
      case 'medium': return 'text-security-medium';
      case 'high': return 'text-security-high';
      case 'critical': return 'text-security-critical';
      default: return 'text-dark-400';
    }
  };

  const getRiskLevelBg = (level) => {
    switch (level) {
      case 'low': return 'bg-security-low/10 border-security-low/30';
      case 'medium': return 'bg-security-medium/10 border-security-medium/30';
      case 'high': return 'bg-security-high/10 border-security-high/30';
      case 'critical': return 'bg-security-critical/10 border-security-critical/30';
      default: return 'bg-dark-700/50 border-dark-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-4 bg-blue-600/20 rounded-full"
          >
            <Shield className="w-12 h-12 text-blue-400" />
          </motion.div>
        </div>
        
        <div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            WebSec Visualizer
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Comprehensive security analysis for any website. Scan for vulnerabilities, 
            misconfigurations, and security risks with our advanced security scanner.
          </p>
        </div>
      </motion.div>

      {/* URL Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card p-8 max-w-2xl mx-auto"
      >
        <UrlInput onSubmit={handleScanSubmit} isLoading={isLoading} />
      </motion.div>

      {/* Scan Progress */}
      {scanId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ScanProgress scanId={scanId} />
        </motion.div>
      )}

      {/* Security Overview Cards */}
      {!scanId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="card p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">SSL/TLS Analysis</h3>
            <p className="text-dark-400 text-sm">
              Comprehensive SSL certificate and protocol security assessment
            </p>
          </div>

          <div className="card p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Search className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Security Headers</h3>
            <p className="text-dark-400 text-sm">
              Check for missing security headers and misconfigurations
            </p>
          </div>

          <div className="card p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Malware Detection</h3>
            <p className="text-dark-400 text-sm">
              Scan for malicious content and suspicious patterns
            </p>
          </div>

          <div className="card p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
            <p className="text-dark-400 text-sm">
              Identify technologies and potential security vulnerabilities
            </p>
          </div>
        </motion.div>
      )}

      {/* Scan Results */}
      {scanData && scanData.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Risk Level Summary */}
          <div className={`card p-6 border-2 ${getRiskLevelBg(scanData.riskLevel)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getRiskLevelBg(scanData.riskLevel)}`}>
                  {scanData.riskLevel === 'low' && <CheckCircle className="w-6 h-6 text-security-low" />}
                  {scanData.riskLevel === 'medium' && <AlertTriangle className="w-6 h-6 text-security-medium" />}
                  {scanData.riskLevel === 'high' && <AlertTriangle className="w-6 h-6 text-security-high" />}
                  {scanData.riskLevel === 'critical' && <AlertTriangle className="w-6 h-6 text-security-critical" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Security Risk Assessment</h2>
                  <p className="text-dark-400">
                    Overall risk level: <span className={`font-semibold ${getRiskLevelColor(scanData.riskLevel)}`}>
                      {scanData.riskLevel.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-dark-100">
                  {scanData.results?.riskScore || 0}%
                </div>
                <div className="text-dark-400 text-sm">Security Score</div>
              </div>
            </div>
          </div>

          {/* Security Overview */}
          <SecurityOverview scanData={scanData} />

          {/* Detailed Results */}
          <ScanResults scanData={scanData} />
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6 border-red-500/30 bg-red-500/10"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">Scan Error</h3>
              <p className="text-dark-300">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      {!scanId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card p-8"
        >
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
            Why Choose WebSec Visualizer?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Analysis</h3>
              <p className="text-dark-400">
                Get instant security insights with our advanced scanning technology
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comprehensive Coverage</h3>
              <p className="text-dark-400">
                Analyze SSL, headers, malware, ports, and technology stack
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Actionable Insights</h3>
              <p className="text-dark-400">
                Receive detailed recommendations to improve your security posture
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard; 