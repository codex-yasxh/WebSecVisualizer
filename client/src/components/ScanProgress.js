import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const ScanProgress = ({ scanId }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState(null);

  const scanSteps = [
    { name: 'malware', label: 'Malware Detection', icon: AlertTriangle },
    { name: 'ssl', label: 'SSL/TLS Analysis', icon: Shield },
    { name: 'headers', label: 'Security Headers', icon: Shield },
    { name: 'tech', label: 'Technology Stack', icon: Shield },
    { name: 'ports', label: 'Port Scanning', icon: Shield },
    { name: 'whois', label: 'Domain Information', icon: Shield }
  ];

  useEffect(() => {
    const pollProgress = async () => {
      try {
        const response = await axios.get(`/api/scan/${scanId}/status`);
        const { progress: currentProgress, status: currentStatus } = response.data;
        
        setProgress(currentProgress);
        setStatus(currentStatus);

        // Determine current step based on progress
        const stepIndex = Math.floor((currentProgress / 100) * scanSteps.length);
        if (stepIndex < scanSteps.length) {
          setCurrentStep(scanSteps[stepIndex].name);
        }

        // Continue polling if scan is still in progress
        if (currentStatus === 'pending' || currentStatus === 'scanning') {
          setTimeout(pollProgress, 2000);
        }
      } catch (error) {
        console.error('Error polling scan progress:', error);
        setError('Failed to get scan progress');
      }
    };

    pollProgress();
  }, [scanId]);

  const getStepStatus = (stepName) => {
    const stepIndex = scanSteps.findIndex(step => step.name === stepName);
    const stepProgress = (stepIndex + 1) * (100 / scanSteps.length);
    
    if (progress >= stepProgress) {
      return 'completed';
    } else if (currentStep === stepName) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'active': return 'text-blue-400';
      case 'pending': return 'text-dark-400';
      default: return 'text-dark-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/30';
      case 'active': return 'bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'bg-dark-700/50 border-dark-600';
      default: return 'bg-dark-700/50 border-dark-600';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Security Scan in Progress</h3>
            <p className="text-dark-400">Analyzing website security...</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-dark-100">{progress}%</div>
          <div className="text-dark-400 text-sm">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Scan Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scanSteps.map((step, index) => {
          const stepStatus = getStepStatus(step.name);
          const Icon = step.icon;
          
          return (
            <motion.div
              key={step.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getStatusBg(stepStatus)} transition-all duration-300`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getStatusBg(stepStatus)}`}>
                  {stepStatus === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : stepStatus === 'active' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  ) : (
                    <Icon className={`w-5 h-5 ${getStatusColor(stepStatus)}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${getStatusColor(stepStatus)}`}>
                    {step.label}
                  </div>
                  <div className="text-sm text-dark-400">
                    {stepStatus === 'completed' && 'Completed'}
                    {stepStatus === 'active' && 'In Progress...'}
                    {stepStatus === 'pending' && 'Pending'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 bg-dark-700/50 rounded-lg">
        <div className="flex items-center space-x-3">
          {status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : status === 'scanning' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="w-5 h-5 text-blue-400" />
            </motion.div>
          ) : (
            <Clock className="w-5 h-5 text-dark-400" />
          )}
          <div>
            <div className="font-medium text-dark-100">
              {status === 'completed' && 'Scan completed successfully!'}
              {status === 'scanning' && 'Scanning in progress...'}
              {status === 'pending' && 'Initializing scan...'}
              {status === 'failed' && 'Scan failed'}
            </div>
            <div className="text-sm text-dark-400">
              {status === 'completed' && 'All security checks have been completed'}
              {status === 'scanning' && 'Please wait while we analyze the website'}
              {status === 'pending' && 'Preparing to start security analysis'}
              {status === 'failed' && 'An error occurred during the scan'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <div className="font-medium text-red-400">Error</div>
              <div className="text-sm text-dark-300">{error}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScanProgress; 