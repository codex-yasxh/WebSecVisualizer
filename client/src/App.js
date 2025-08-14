import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import ScanHistory from './pages/ScanHistory';
import About from './pages/About';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-security-pattern opacity-5 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<ScanHistory />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App; 