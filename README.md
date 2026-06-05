# Career Portal - chai-homelab.com

FAANG-quality terminal-themed portfolio with synthwave aesthetic.

## 🎯 Architecture

```
career-portal/
├── index.html          # Single-page application entry
├── css/
│   └── styles.css      # Synthwave theme (CRT effects, neon colors)
├── js/
│   ├── terminal.js     # Core terminal logic & command handler
│   ├── command-parser.js  # Command parsing service
│   ├── github-api.js   # GitHub API integration
│   └── audio.js        # Keystroke sound effects
├── scripts/
│   └── cloudflare-dns-update.sh  # Dynamic IP DNS automation
├── .github/workflows/
│   ├── ci.yml          # Lint, test, build pipeline
│   └── deploy.yml      # Azure Blob Storage deployment
└── package.json        # Dependencies & scripts
```

## 🚀 Features

- **Terminal Interface**: Interactive command-based navigation
- **Synthwave Theme**: Pink/purple/cyan neon colors with CRT effects
- **GitHub Integration**: Real-time project fetch from chaitea321
- **Progressive Enhancement**: Works without JS, enhanced with JS
- **Audio Effects**: Hidden toggle for keystroke sounds (disabled by default)
- **Dynamic DNS**: Cloudflare auto-update for dynamic public IP
- **FAANG Code Quality**: ES6 modules, SOLID principles, separation of concerns

## 📋 Commands

| Command | Description |
|---------|-------------|
| `help` | Show available commands |
| `projects [filter]` | List GitHub projects (optional: filter by keyword) |
| `skills [category]` | Show technical skills (optional: category) |
| `about` | About Chaitanya Kumar |
| `contact` | Contact information |
| `clear` | Clear terminal output |
| `theme` | Toggle synthwave theme |

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), CSS3
- **Hosting**: Azure Blob Storage ($6/year)
- **DNS**: Cloudflare (Free tier with CDN proxy)
- **CI/CD**: GitHub Actions
- **Dynamic IP**: Cloudflare API auto-update script

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/chaitea321/career-portal.git
cd career-portal

# Install dependencies (optional for dev)
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

## 🌐 Deployment

### 1. Create Cloudflare API Token

- Go to Cloudflare Dashboard > API Tokens
- Create token with **Zone Read** + **DNS Edit** permissions
- Scope: `zone.*` for chai-homelab.com
- Copy token to `.env` or GitHub Secrets

### 2. Set Environment Variables

```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id"
```

### 3. Deploy to Azure Blob

```bash
# Upload to Azure Blob Storage container ($web)
az storage blob upload-batch \
  --source ./dist \
  --destination \$web \
  --account-name chaihomelab \
  --account-key ${AZURE_STORAGE_KEY}
```

### 4. Update Cloudflare DNS

```bash
# Run auto-update script (set up cron every 30 mins)
./scripts/cloudflare-dns-update.sh

# Add to crontab (every 30 minutes)
*/30 * * * * /path/to/career-portal/scripts/cloudflare-dns-update.sh
```

## 🔧 GitHub Actions Setup

Create these secrets in repository settings:

- `AZURE_STORAGE_CONNECTION_STRING`: Azure Blob storage connection string
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token (for dynamic DNS)

## 💰 Cost Breakdown

| Service | Cost/Month |
|---------|------------|
| Azure Blob Storage | ~$0.50 (first 5GB + 10GB bandwidth) |
| Cloudflare DNS | $0 (Free tier) |
| GitHub Actions | $0 (Free minutes) |
| **Total** | **~$6/year** |

## 📊 Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Bundle Size**: <100KB (vanilla JS)
- **TTI**: <2s (fast terminal response)
- **Uptime**: 99.9% (Cloudflare CDN)

## 🎓 Internship-Ready Artifacts

1. **Live Terminal Portfolio**: Shows frontend mastery + UX design
2. **GitHub API Integration**: Demonstrates RESTful API consumption
3. **CI/CD Pipeline**: Full GitHub Actions workflow
4. **Dynamic DNS Automation**: Cloudflare API integration
5. **Cost-Optimized Hosting**: $6/year production deployment

## 🔄 Future Enhancements

- [ ] Azure Functions for dynamic content (skills, contact)
- [ ] OpenTelemetry tracing for command analytics
- [ ] MeshWatch service status display on homepage
- [ ] Ollama Phi-3 analysis of visitor interactions
- [ ] Canary deployments with Flagger

## 📝 License

MIT License - See LICENSE file for details
