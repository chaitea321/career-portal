# Career Portal - chai-homelab.com

FAANG-quality terminal-themed portfolio with synthwave aesthetic, Azure Functions API gateway, Tailscale-secured Ollama AI, and career fair demo mode.

## 🎯 Architecture

```
                         ┌─────────────────────┐
                         │  Browser (Visitor)   │
                         │  chai-homelab.com    │
                         └─────────┬──────────┘
                                 │ HTTPS / CDN
                    ════════════ Cloudflare ════════════
                                 │
            ┌───────────────────┬───────────────────┐
            │                   │                   │
   ┌────────┴────────┐ ──┐  ──┐└────────┴────────┐
   │ Static Assets   │    │     Azure Functions    │
   │ (Blob Storage)  │    │  ($0.50/mo tier-free)  │
   │ - index.html    │    │                        │
   │ - CSS/JS        │    │ ┌──────────────┐       │
   │ - PWA SW        │    │ │portfolio-    │       │
   │                 │    │ │metrics/      │       │
   │                 │    │ │GitHub OAuth  │       │
   │                 │    │ │→ Prometheus  │       │
   │                 │    │ └──────────────┘       │
   │                 │    │                        │
   │                 │    │ ┌──────────────┐       │
   │                 │    │ │portfolio-    │       │
   │                 │    │ │agent/        │       │
   │                 │    │ │Ollama Proxy  │       │
   │                 │    │ └──────┬───────┘       │
            │                   │                   │
            │                   │ Tailscale (WireGuard)
            │                   │ outbound-only tunnel
            │                   │ (no firewall holes)
            │                   │
     ════════ HP Laptop/k3s Cluster ═══════════════
            │
   ┌────────┴────────┐
   │ MeshWatch Stack  │
   │ - Istio mTLS     │
   │ - Prometheus     │
   │ - Grafana        │
   │ - Loki/Tempo     │
   │ - Ollama Phi-3   │
   │ - Minecraft JMX  │
   └─────────────────┘
```

## 🚀 Features

### Terminal Interface (v2.0)
- **14 Commands**: help, projects, project, skills, experience, education, resume, about, contact, status, minecraft, ai, demo, clear, theme
- **Category Filtering**: `projects devops`, `projects cloud`, `projects iot`, `projects web`
- **Deep-Dive**: `project meshwatch` shows full tech stack, metrics, badges, achievements
- **Live Status**: `status` shows online/offline, MeshWatch metrics, browser info
- **Minecraft Stats**: `minecraft` shows live TPS, players, uptime via Azure Functions
- **AI Assistant**: `ai <question>` asks portfolio Q&A with Ollama Phi-3 (cached fallback)
- **Demo Mode**: `demo` or click "Start Demo Mode" button for auto-cycling project showcase

### API Integrations
- **GitHub OAuth PKCE**: Secure token exchange in browser memory only (`public_repo`, `read:user`)
- **Azure Functions Gateway**: Whitelisted Prometheus queries only (no raw DB access)
- **Tailscale Proxy**: Outbound-only WireGuard tunnel to local Ollama Phi-3 ($0 cost, no firewall holes)

### Career Fair Demo Mode
- Auto-cycles through all 6 projects with badges and metrics
- Pause on any keypress or type `demo stop`
- Offline fallback: all mock data from `config/career-fair.json`
- Recruiter view toggle for highlighting achievements

## 📋 Commands

| Command | Description |
|---------|-------------|
| `help` | Show available commands + categories + keyboard shortcuts |
| `projects [category]` | List projects (optional: cloud, devops, iot, web) |
| `project <name>` | Deep-dive into project (tech stack, badges, metrics, achievements) |
| `skills [category]` | Show technical skills (optional: category) |
| `experience [level]` | Show work experience (senior/mid/junior) |
| `education` | Show education background |
| `resume` | Download resume text format |
| `about` | About Chaitanya Kumar |
| `contact` | Contact information |
| `status` | Show system/live metrics status (requires Azure Functions + GitHub OAuth) |
| `minecraft` | Show Minecraft server live stats (TPS, players, uptime) |
| `ai <question>` | Ask AI about your portfolio (Ollama Phi-3 with cached fallback) |
| `demo [stop]` | Start/stop auto-cycling project showcase |
| `clear` | Clear terminal output |
| `theme` | Toggle synthwave/retro theme |

## 🛠️ Tech Stack

### Frontend
- **Vanilla JS (ES6 Modules)**: Terminal interface, API clients, visual effects
- **CSS3 + Animations**: Synthwave theme with CRT effects, neon pulse, matrix rain
- **PWA**: Service worker caching, web app manifest, offline fallback
- **Accessibility**: WCAG 2.1 compliant (ARIA live regions, keyboard nav, reduced motion)

### Backend / Serverless
- **Azure Functions v2.0**: Python runtime for metrics proxy + AI agent proxy
- **GitHub OAuth PKCE**: Browser-side token exchange (memory-only storage)
- **Tailscale**: WireGuard mesh network for secure local Ollama access

### Monitoring Stack (k3s Cluster)
- Istio service mesh with mTLS
- Prometheus + Grafana + Loki + Tempo observability
- Ollama Phi-3 for AI-powered incident analysis
- Minecraft JMX exporter for server metrics

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

### 1. Static Site (Azure Blob Storage)

```bash
# Deploy to Azure Blob Storage container ($web)
az storage blob upload-batch \
  --source ./dist \
  --destination \$web \
  --account-name chaihomelab \
  --account-key ${AZURE_STORAGE_KEY}
```

### 2. Cloudflare DNS (Dynamic IP)

```bash
# Generate API token in Cloudflare Dashboard > API Tokens
# Permissions: Zone Read + DNS Edit, scope: zone.* for chai-homelab.com

export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id"
export CURRENT_IP="108.233.139.113"  # Your dynamic public IP

# Run auto-update script (set up cron every 30 mins)
./scripts/cloudflare-dns-update.sh

# Add to crontab (every 30 minutes)
echo "*/30 * * * * /path/to/career-portal/scripts/cloudflare-dns-update.sh" | crontab -
```

### 3. Azure Functions Deployment

```bash
cd ../azure-functions

# Deploy portfolio-metrics function
func deploy portfolio-metrics --settings ../career-portal/local.settings.json

# Deploy portfolio-agent function
func deploy portfolio-agent --settings ../career-portal/local.settings.json

# Set environment variables via Azure portal or CLI:
# TAILSCALE_OLLAMA_URL=http://100.x.x.x:11434  (Tailscale tailnet IP)
# OLLAMA_MODEL=phi-3
# PROMETHEUS_URL=http://prometheus:9090
# SERVICE_BUS__fullyQualifiedNamespace=<your-servicebus>
```

### 4. Tailscale Setup (Local Ollama Access)

```bash
# On k3s cluster node (HP laptop)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=tskey-xxxxx

# Verify Ollama endpoint is reachable via tailnet IP
curl http://100.65.214.138:11434/version  # Should return Phi-3 version

# Test Azure Function can reach it (outbound-only, no firewall holes needed)
```

### 5. GitHub OAuth Setup

```bash
# Register OAuth app at https://github.com/settings/connections/applications
# Redirect URI: https://chai-homelab.com/auth/callback
# Scopes: public_repo, read:user

# Store client secret in Azure Functions App Settings (Environment Variables)
# Note: PKCE flow uses code_verifier stored in sessionStorage only
```

## 🔧 GitHub Actions Setup

Create these secrets in repository settings:

| Secret | Description |
|--------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob storage connection string |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (for dynamic DNS) |
| `AZURE_FUNCTION_CONNECTION_STRING` | Azure Functions deployment connection |

## 💰 Cost Breakdown

| Service | Cost/Month | Notes |
|---------|------------|-------|
| Azure Blob Storage | ~$0.50 | First 5GB + 10GB bandwidth free |
| Azure Functions | $0 | Free tier (1M invocations/mo) |
| Cloudflare DNS/CDN | $0 | Free tier with SSL, DDoS protection |
| Tailscale | $0 | Personal plan (<5 devices) |
| GitHub Actions | $0 | Free minutes for public repos |
| **Total** | **~$0.50/mo** | **~$6/year** |

## 📊 Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Bundle Size**: <150KB (vanilla JS + CSS)
- **TTI**: <2s (fast terminal response)
- **Uptime**: 99.9% (Cloudflare CDN)
- **Tests Passing**: 27/27

## 🎓 Internship-Ready Artifacts

1. **Live Terminal Portfolio with API Integration**: Shows frontend mastery + backend integration via Azure Functions
2. **Secure Metrics API**: GitHub OAuth PKCE flow whitelisting Prometheus queries (FAANG-quality security)
3. **Tailscale-Ollama Proxy**: Demonstrates secure outbound-only tunneling to local AI ($0 cost, more impressive than cloud AI)
4. **Career Fair Demo Mode**: Auto-cycling showcase with offline fallback
5. **PWA + Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support
6. **CI/CD Pipeline**: Full GitHub Actions workflow (lint → test → build → deploy)
7. **Dynamic DNS Automation**: Cloudflare API integration for dynamic IP
8. **Cost-Optimized Architecture**: $0.50/month total vs $10+/month for cloud alternatives

## 🔄 Deployment Checklist

### Pre-Career Fair
- [ ] Verify `npm run build` passes (lint + test + dist)
- [ ] Confirm Azure Blob deployment is current
- [ ] Test career fair demo mode (`demo` command or button)
- [ ] Verify AI assistant cached answers work without Ollama
- [ ] Check PWA offline fallback works

### Live Demo Flow
1. Open terminal → Type `help` to show all commands
2. Run `projects devops` to show project filtering
3. Run `project meshwatch` for deep-dive on flagship project
4. Run `status` to show live metrics (if Azure Functions deployed)
5. Run `minecraft` to show Minecraft monitoring stats
6. Run `ai Tell me about MeshWatch` for AI Q&A demo
7. Click "Start Demo Mode" for auto-cycling showcase

## 📝 License

MIT License - See LICENSE file for details
# Trigger CI/CD deployment
