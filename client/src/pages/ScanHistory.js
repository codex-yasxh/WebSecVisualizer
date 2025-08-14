import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useRecentScans } from '../hooks/useScan';

const ScanHistory = () => {
  const { data: recentScans, isLoading, error } = useRecentScans();

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'scanning':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-dark-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span className="ml-3 text-dark-400">Loading scan history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 border-red-500/30 bg-red-500/10">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="font-semibold text-red-400">Error Loading History</h3>
            <p className="text-dark-300">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Scan History</h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          View your recent security scans and their results. Track your security improvements over time.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-dark-100 mb-2">
            {recentScans?.total || 0}
          </div>
          <div className="text-dark-400">Total Scans</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {recentScans?.scans?.filter(s => s.riskLevel === 'low').length || 0}
          </div>
          <div className="text-dark-400">Low Risk</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-amber-400 mb-2">
            {recentScans?.scans?.filter(s => s.riskLevel === 'medium').length || 0}
          </div>
          <div className="text-dark-400">Medium Risk</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-red-400 mb-2">
            {recentScans?.scans?.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length || 0}
          </div>
          <div className="text-dark-400">High Risk</div>
        </div>
      </motion.div>

      {/* Scan List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4"
      >
        {recentScans?.scans?.length === 0 ? (
          <div className="card p-12 text-center">
            <Shield className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Scans Yet</h3>
            <p className="text-dark-400 mb-6">
              Start your first security scan to see results here.
            </p>
            <a
              href="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Start First Scan</span>
            </a>
          </div>
        ) : (
          recentScans?.scans?.map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card p-6 hover:shadow-lg transition-all duration-300 ${getRiskLevelBg(scan.riskLevel)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${getRiskLevelBg(scan.riskLevel)}`}>
                    {getStatusIcon(scan.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-dark-100">
                        {scan.url}
                      </h3>
                      <a
                        href={scan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-400 hover:text-dark-200 transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-dark-400">
                      <span>Scanned: {formatDate(scan.startTime)}</span>
                      {scan.endTime && (
                        <span>Completed: {formatDate(scan.endTime)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${getRiskLevelColor(scan.riskLevel)}`}>
                    {scan.riskLevel?.toUpperCase() || 'UNKNOWN'}
                  </div>
                  <div className="text-sm text-dark-400">
                    {scan.progress}% Complete
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${scan.progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card p-6 bg-blue-500/10 border-blue-500/30"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-3 h-3 text-blue-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">Scan History Notice</h4>
            <p className="text-sm text-dark-300">
              This is a demo version. In a production environment, scan history would be persisted 
              and you would be able to compare results over time and track security improvements.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScanHistory; 