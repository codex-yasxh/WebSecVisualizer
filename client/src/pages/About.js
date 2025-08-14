import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Zap, Github, Twitter, Mail } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'SSL/TLS Analysis',
      description: 'Comprehensive SSL certificate and protocol security assessment',
      color: 'text-blue-400'
    },
    {
      icon: Search,
      title: 'Security Headers',
      description: 'Check for missing security headers and misconfigurations',
      color: 'text-green-400'
    },
    {
      icon: AlertTriangle,
      title: 'Malware Detection',
      description: 'Scan for malicious content and suspicious patterns',
      color: 'text-amber-400'
    },
    {
      icon: Zap,
      title: 'Tech Stack Analysis',
      description: 'Identify technologies and potential security vulnerabilities',
      color: 'text-purple-400'
    },
    {
      icon: Clock,
      title: 'Real-time Scanning',
      description: 'Get instant security insights with live progress updates',
      color: 'text-cyan-400'
    },
    {
      icon: CheckCircle,
      title: 'Actionable Recommendations',
      description: 'Receive detailed guidance to improve your security posture',
      color: 'text-emerald-400'
    }
  ];

  const technologies = [
    'React.js', 'Node.js', 'Express.js', 'Tailwind CSS', 'D3.js', 'Framer Motion',
    'VirusTotal API', 'SSL Labs API', 'Wappalyzer API', 'Shodan API'
  ];

  return (
    <div className="space-y-12">
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
            className="p-6 bg-blue-600/20 rounded-full"
          >
            <Shield className="w-16 h-16 text-blue-400" />
          </motion.div>
        </div>
        
        <div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            About WebSec Visualizer
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            A comprehensive security scanner that analyzes any website for vulnerabilities, 
            misconfigurations, and security risks with an interactive dashboard.
          </p>
        </div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card p-8 text-center"
      >
        <h2 className="text-3xl font-bold mb-6 gradient-text">Our Mission</h2>
        <p className="text-lg text-dark-300 max-w-4xl mx-auto leading-relaxed">
          WebSec Visualizer was created to democratize security analysis, making it accessible 
          for developers, security professionals, and website owners to understand and improve 
          their security posture. We believe that security should be transparent, actionable, 
          and easy to understand.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-8"
      >
        <h2 className="text-3xl font-bold text-center gradient-text">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card p-6 hover:shadow-glow transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <feature.icon className={`w-12 h-12 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
              <p className="text-dark-400 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card p-8"
      >
        <h2 className="text-3xl font-bold text-center gradient-text mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-400">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Enter URL</h3>
            <p className="text-dark-400">
              Simply enter any website URL you want to analyze for security vulnerabilities.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-400">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Analysis</h3>
            <p className="text-dark-400">
              Our advanced scanner performs comprehensive security checks in real-time.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-400">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Get Results</h3>
            <p className="text-dark-400">
              View detailed security reports with actionable recommendations.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="card p-8"
      >
        <h2 className="text-3xl font-bold text-center gradient-text mb-8">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              className="bg-dark-700/50 border border-dark-600 rounded-lg p-3 text-center hover:border-blue-500/50 transition-colors duration-200"
            >
              <span className="text-sm font-medium text-dark-200">{tech}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security & Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="card p-6 bg-green-500/10 border-green-500/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-green-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-1">Security First</h4>
              <p className="text-sm text-dark-300">
                We perform non-intrusive security scans that don't affect your website's performance 
                or security. All scans are conducted ethically and responsibly.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-blue-500/10 border-blue-500/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-1">Privacy Protected</h4>
              <p className="text-sm text-dark-300">
                We don't store or share your scan results. All analysis is performed in real-time 
                and results are not persisted on our servers.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact & Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="card p-8 text-center"
      >
        <h2 className="text-3xl font-bold gradient-text mb-6">Get in Touch</h2>
        <p className="text-lg text-dark-300 mb-8 max-w-2xl mx-auto">
          Have questions, suggestions, or want to contribute? We'd love to hear from you!
        </p>
        
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
          
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
          >
            <Twitter className="w-5 h-5" />
            <span>Twitter</span>
          </a>
          
          <a
            href="mailto:contact@websecvisualizer.com"
            className="flex items-center space-x-2 px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </a>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="card p-6 bg-amber-500/10 border-amber-500/30"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-400 mb-1">Important Disclaimer</h4>
            <p className="text-sm text-dark-300">
              This tool is for educational and security assessment purposes only. Always ensure 
              you have permission to scan any website. The results provided are for informational 
              purposes and should not be considered as professional security advice.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About; 