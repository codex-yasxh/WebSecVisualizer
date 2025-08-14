# WebSec Visualizer 🔒

A comprehensive visual security scanner that analyzes any website for vulnerabilities, misconfigurations, and security risks with an interactive dashboard.

## 🌟 Features

### 🔍 Security Analysis
- **Malware Detection**: Scan URLs for malicious content using VirusTotal API
- **Attack Surface Analysis**: Identify open ports and exposed services
- **SSL/TLS Assessment**: Comprehensive HTTPS security evaluation
- **Security Headers Audit**: Check for missing security headers (CSP, XSS Protection, etc.)
- **Tech Stack Fingerprinting**: Identify technologies and frameworks used
- **Domain Intelligence**: WHOIS information, domain age, and registration details

### 📊 Interactive Dashboard
- **Radar Chart**: Visual vulnerability score breakdown
- **Bar Graphs**: Security headers compliance
- **Pie Charts**: Risk category distribution
- **Real-time Scanning**: Live progress updates
- **Risk Scoring**: High/Medium/Low risk assessment
- **Recommendations**: Actionable security improvements

### 🛡️ Advanced Features
- **Rate Limiting**: API usage protection
- **CORS Security**: Cross-origin request handling
- **Error Handling**: Graceful failure management
- **Responsive Design**: Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API Keys (see Configuration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebSecVisualizer
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   Frontend: http://localhost:3000
   Backend: http://localhost:5000
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# API Keys (Get these from respective services)
VIRUSTOTAL_API_KEY=your_virustotal_api_key
WAPPALYZER_API_KEY=your_wappalyzer_api_key
SHODAN_API_KEY=your_shodan_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3000
```

### Required API Keys

1. **VirusTotal**: [Get API Key](https://www.virustotal.com/gui/join-us)
2. **Wappalyzer**: [Get API Key](https://www.wappalyzer.com/api)
3. **Shodan**: [Get API Key](https://account.shodan.io/register)

## 📖 Usage

1. **Enter a URL**: Input any website URL (e.g., `https://example.com`)
2. **Start Scan**: Click the scan button to begin analysis
3. **View Results**: Monitor real-time progress and view comprehensive results
4. **Analyze Dashboard**: Explore interactive charts and security metrics
5. **Get Recommendations**: Review actionable security improvements

## 🏗️ Architecture

```
WebSecVisualizer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Security scanning services
│   ├── middleware/        # Express middleware
│   └── utils/             # Backend utilities
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 API Endpoints

### Security Scan
- `POST /api/scan` - Start a new security scan
- `GET /api/scan/:id` - Get scan results
- `GET /api/scan/:id/status` - Get scan status

### Analysis Results
- `GET /api/analysis/ssl/:domain` - SSL/TLS analysis
- `GET /api/analysis/headers/:domain` - Security headers check
- `GET /api/analysis/tech/:domain` - Technology detection
- `GET /api/analysis/malware/:url` - Malware detection

## 🎨 UI/UX Features

- **Dark Theme**: Modern black background with polished components
- **Interactive Charts**: D3.js powered visualizations
- **Real-time Updates**: Live progress indicators
- **Responsive Design**: Mobile-friendly interface
- **Smooth Animations**: Enhanced user experience

## 🔒 Security Considerations

- Rate limiting to prevent API abuse
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Environment variable protection

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation

## 🔮 Future Roadmap

- [ ] User authentication system
- [ ] Scan history and comparison
- [ ] Scheduled re-scanning
- [ ] Email alerts for vulnerabilities
- [ ] PDF report export
- [ ] Freemium SaaS model
- [ ] Advanced vulnerability scanning
- [ ] Integration with more security tools

---

**Built with ❤️ for the security community** 