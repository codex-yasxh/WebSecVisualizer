import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900/80 border-t border-dark-700 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">WebSec Visualizer</h3>
                <p className="text-sm text-dark-400">Advanced Security Scanner</p>
              </div>
            </div>
            <p className="text-dark-300 mb-4 max-w-md">
              Comprehensive security analysis for any website. Scan for vulnerabilities, 
              misconfigurations, and security risks with our advanced security scanner.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 rounded-md transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 rounded-md transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@websecvisualizer.com"
                className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 rounded-md transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-dark-100">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-dark-400 hover:text-dark-100 transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-dark-400 hover:text-dark-100 transition-colors duration-200"
                >
                  Scan History
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-dark-400 hover:text-dark-100 transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Security Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-dark-100">Security</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-dark-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-dark-400">Terms of Service</span>
              </li>
              <li>
                <span className="text-dark-400">Security Notice</span>
              </li>
              <li>
                <span className="text-dark-400">API Documentation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dark-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-dark-400">
              <span>&copy; {currentYear} WebSec Visualizer. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-dark-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span>for the security community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 