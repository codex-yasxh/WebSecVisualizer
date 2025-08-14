import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const ScanResults = ({ scanData }) => {
  if (!scanData || !scanData.results) {
    return null;
  }

  const { results } = scanData;

  const getStatusIcon = (status) => {
    if (!status) return <Info className="w-5 h-5 text-blue-400" />;
    
    switch (status.toLowerCase()) {
      case 'secure':
      case 'good':
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
      case 'medium':
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'vulnerable':
      case 'high':
      case 'failed':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-blue-400';
    
    switch (status.toLowerCase()) {
      case 'secure':
      case 'good':
      case 'passed':
        return 'text-green-400';
      case 'warning':
      case 'medium':
      case 'caution':
        return 'text-yellow-400';
      case 'vulnerable':
      case 'high':
      case 'failed':
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'UNKNOWN';
    return String(status).toUpperCase();
  };

  const renderAnalysisSection = (title, data, icon) => {
    if (!data) return null;

    // Safely get status with fallback
    const status = data.status || 'unknown';
    const score = data.score || 0;
    const recommendations = data.recommendations || [];
    const details = data.details || {};

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          {icon}
          <h3 className="text-xl font-semibold text-dark-100">{title}</h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <span className={`font-medium ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {score > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Security Score:</span>
              <span className={`font-bold ${getStatusColor(status)}`}>
                {score}%
              </span>
            </div>
          )}

          {recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-dark-200 mb-2">Recommendations:</h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="text-dark-300 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(details).length > 0 && (
            <div>
              <h4 className="font-semibold text-dark-200 mb-2">Details:</h4>
              <div className="bg-dark-800 rounded-lg p-3">
                <pre className="text-dark-300 text-sm whitespace-pre-wrap">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-dark-100">Detailed Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAnalysisSection('SSL/TLS Security', results.ssl, <Shield className="w-5 h-5 text-blue-400" />)}
        {renderAnalysisSection('Security Headers', results.headers, <Shield className="w-5 h-5 text-green-400" />)}
        {renderAnalysisSection('Malware Detection', results.malware, <AlertTriangle className="w-5 h-5 text-red-400" />)}
        {renderAnalysisSection('Port Security', results.ports, <Shield className="w-5 h-5 text-purple-400" />)}
        {renderAnalysisSection('Technology Stack', results.tech, <Info className="w-5 h-5 text-cyan-400" />)}
        {renderAnalysisSection('Domain Information', results.whois, <Info className="w-5 h-5 text-orange-400" />)}
      </div>
    </motion.div>
  );
};

export default ScanResults; 