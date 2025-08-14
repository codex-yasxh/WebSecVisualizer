#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 WebSec Visualizer Setup');
console.log('==========================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js ${nodeVersion} detected`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js 16 or higher.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm ${npmVersion} detected\n`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm.');
  process.exit(1);
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚙️  Creating .env file...');
  const envContent = `# WebSec Visualizer Environment Configuration

# Server Configuration
PORT=5000
NODE_ENV=development

# API Keys (Get these from respective services)
# VirusTotal: https://www.virustotal.com/gui/join-us
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# Wappalyzer: https://www.wappalyzer.com/api
WAPPALYZER_API_KEY=your_wappalyzer_api_key_here

# Shodan: https://account.shodan.io/register
SHODAN_API_KEY=your_shodan_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created\n');
} else {
  console.log('✅ .env file already exists\n');
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit the .env file and add your API keys');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, check the README.md file');
console.log('\n�� Happy scanning!'); 