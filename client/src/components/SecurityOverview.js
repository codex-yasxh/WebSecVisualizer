import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const SecurityOverview = ({ scanData }) => {
  if (!scanData || !scanData.results || typeof scanData.results !== 'object') {
    return null;
  }

  const { results } = scanData;

  // Safe number conversion utility
  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
  };

  // Prepare radar chart data with safe defaults
  const radarData = [
    { name: 'SSL/TLS', value: safeNumber(results.ssl?.score) },
    { name: 'Headers', value: safeNumber(results.headers?.score) },
    { name: 'Malware', value: safeNumber(results.malware?.score) },
    { name: 'Ports', value: safeNumber(results.ports?.score) },
    { name: 'Tech Stack', value: safeNumber(results.tech?.score) },
    { name: 'Domain', value: safeNumber(results.whois?.score) }
  ];

  const getScoreColor = (score) => {
    const numScore = safeNumber(score);
    if (numScore >= 80) return 'text-green-400';
    if (numScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score) => {
    const numScore = safeNumber(score);
    if (numScore >= 80) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (numScore >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-dark-100">Security Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-dark-100">Security Score Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                />
                <Radar
                  name="Security Score"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-dark-100">Individual Scores</h3>
          <div className="space-y-4">
            {radarData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getScoreIcon(item.value)}
                  <span className="text-dark-300">{item.name}</span>
                </div>
                <span className={`font-semibold ${getScoreColor(item.value)}`}>
                  {Math.round(item.value)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityOverview; 