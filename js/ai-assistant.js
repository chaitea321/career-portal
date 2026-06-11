// AI Assistant - Ollama integration via Tailscale + Azure Functions proxy
// Provides portfolio Q&A with cached fallback when live deployment is unavailable

class AIAssistant {
  constructor() {
    const baseUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin + '/api/agent' : '/api/agent';
    this.AZURE_AGENT_BASE = baseUrl;
    this.DEFAULT_MODEL = 'phi-3';
    this._configUrl = '/config/career-fair.json';
    this.TAILSCALE_OLLAMA_URL = null; // Loaded from config - no hardcoded fallback
    this._systemPrompt = `You are an AI assistant for Eugene Vincent's developer portfolio at chai-homelab.com. 
Answer questions about their projects, skills, experience, and technical decisions. 
Be concise, technical, and highlight key achievements.
Key facts:
- Full Stack Engineer specializing in Azure DevOps, cloud-native architectures, and software reliability engineering
- Built MeshWatch: cost-optimized service mesh observability on k3s with Istio
- Integrated Ollama Phi-3 for AI-powered incident analysis; training/fine-tuning LLMs locally to reduce costs
- Reduced monitoring costs by 60% vs serverless alternatives ($5.12/month)
- Minecraft monitoring stack with Discord bot integration (10 slash commands)
- Tech stack: Kubernetes, Istio, Prometheus, Grafana, Loki, Azure Functions, React, Node.js, Python
- B.S. Computer Science 2024-2028 (University of Illinois), AZ-900 Certified`;
    // Load config in background - non-blocking
    this._loadConfigSilently();
  }

  async _loadConfigSilently() {
    try {
      const resp = await fetch(this._configUrl);
      if (resp.ok) {
        const config = await resp.json();
        if (config.aiAssistant?.tailscaleUrl) {
          this.TAILSCALE_OLLAMA_URL = config.aiAssistant.tailscaleUrl;
        }
        if (config.aiAssistant?.model) {
          this.DEFAULT_MODEL = config.aiAssistant.model;
        }
      }
    } catch (e) {
      // Config not available - using defaults; no error needed
    }
  }

  // Query Ollama AI with a user question about the portfolio
  async query(question) {
    if (typeof window === 'undefined') {
      return { success: false, data: this._getCachedAnswer(question) };
    }

    const messages = [
      { role: 'system', content: this._systemPrompt },
      { role: 'user', content: question }
    ];

    // Try Azure Functions proxy first (preferred when deployed)
    const azureResult = await this._queryViaAzure(messages);
    if (azureResult.success) {
      return azureResult;
    }

    // Fallback to direct Tailscale Ollama access
    const tailscaleResult = await this._queryViaTailscale(messages);
    if (tailscaleResult.success) {
      return tailscaleResult;
    }

    // Last resort: cached knowledge answers
    return {
      success: false,
      data: this._getCachedAnswer(question)
    };
  }

  // Query via Azure Functions proxy (GitHub OAuth authenticated)
  async _queryViaAzure(messages) {
    try {
      const response = await fetch(`${this.AZURE_AGENT_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model: this.DEFAULT_MODEL }),
        signal: AbortSignal.timeout(5000) // 5s timeout to avoid hanging
      });

      if (!response.ok) {
        throw new Error(`Azure agent failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.response };
    } catch (error) {
      // Azure Functions not deployed yet - expected in dev/demo mode
      return { success: false, error: 'Azure proxy unavailable' };
    }
  }

  // Query Ollama directly via Tailscale (outbound-only tunnel, no firewall holes)
  async _queryViaTailscale(messages) {
    if (!this.TAILSCALE_OLLAMA_URL) {
      return { success: false, error: 'Tailscale URL not configured' };
    }
    try {
      const response = await fetch(`${this.TAILSCALE_OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 512
          }
        }),
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`Tailscale Ollama failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.message?.content || data.response };
    } catch (error) {
      // Tailscale network unreachable - expected if not connected
      return { success: false, error: 'Tailscale unavailable' };
    }
  }

  // Cached knowledge answers when no AI backend is available
  _getCachedAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes('meshwatch') || q.includes('monitoring')) {
      return 'MeshWatch is a cost-optimized service mesh observability platform built on k3s Kubernetes with Istio. It uses mTLS for service-to-service encryption, OpenTelemetry for distributed tracing, and integrates Ollama Phi-3 AI for automated incident analysis. Key cost savings: $5.12/month vs $7+/month for serverless alternatives - a 60% reduction.';
    }

    if (q.includes('kubernetes') || q.includes('kube') || q.includes('k8s')) {
      return 'I manage Kubernetes clusters using k3s (lightweight K3s) with Istio service mesh for homelab production workloads. This includes ArgoCD GitOps patterns, External Secrets Operator with Azure Key Vault backend, cert-manager for TLS, and kube-prometheus-stack for monitoring. I also implemented canary deployments with Flagger for zero-downtime releases. AZ-900 Certified.';
    }

    if (q.includes('cost') || q.includes('save') || q.includes('price') || q.includes('$')) {
      return 'I reduced monitoring costs by 60% compared to serverless alternatives. My MeshWatch stack runs on a $5/month k3s cluster with Istio, Prometheus, Grafana, Loki, and Tempo - providing full observability (metrics, traces, logs) while saving ~$7/month vs cloud-native managed services.';
    }

    if (q.includes('ollama') || q.includes('ai') || q.includes('phi')) {
      return 'I integrated Ollama Phi-3 on my k3s cluster for automated incident analysis. When alerts fire, the AI analyzes Prometheus metrics and Grafana dashboards to suggest root causes and remediation steps. I\'m also training and fine-tuning LLMs locally to reduce inference costs and automate workflows. Access is via Tailscale (outbound-only tunnel), keeping everything secure without opening firewall ports.';
    }

    if (q.includes('minecraft')) {
      return 'I built a full Minecraft server observability stack with Istio service mesh, Prometheus metrics (TPS, heap memory, GC pauses), and a Discord bot integration with 10 slash commands (/status, /players, /tps, etc.). It uses JMX Exporter for Java metrics and RCON protocol for server control. The AI-powered lag analysis helps identify performance bottlenecks in real-time.';
    }

    if (q.includes('azure') || q.includes('function')) {
      return 'I use Azure Blob Storage ($0.50/month) to host this portfolio statically, with Azure Functions serving as a secure API gateway for exposing Prometheus metrics and proxying Ollama AI queries. GitHub OAuth PKCE flow authenticates users before they can access live cluster metrics.';
    }

    if (q.includes('skills') || q.includes('stack') || q.includes('technology')) {
      return 'My core tech stack includes: Cloud - Azure, Cloudflare, Docker, Kubernetes. Frontend - React.js, Next.js, TypeScript, CSS3, PWA development. Backend - Node.js, Express, Python, FastAPI, GraphQL, REST APIs. DevOps - GitHub Actions, Terraform, Prometheus, Grafana, Loki, Istio service mesh. Focus areas: Azure DevOps, Full Stack Engineering, Software Reliability Engineering.';
    }

    if (q.includes('education') || q.includes('degree') || q.includes('school')) {
      return 'I am pursuing a B.S. in Computer Science at the University of Illinois (2024-2028), with coursework in full-stack web development, data structures, software engineering principles, and database systems. I hold the AZ-900 Azure Fundamentals certification.';
    }

    if (q.includes('experience') || q.includes('work') || q.includes('job')) {
      return 'All my experience comes from homelab projects: 1) Full Stack Engineer - building MeshWatch and integrating Ollama AI, reducing costs by 60%. 2) DevOps Engineer - managing k3s Kubernetes with Istio service mesh, Prometheus/Grafana/Loki monitoring, GitHub Actions CI/CD. These are self-directed projects alongside my university studies (2024-2028).';
    }

    if (q.includes('contact') || q.includes('email') || q.includes('linkedin') || q.includes('github')) {
      return 'You can find me at: Email - eugene.vince55@gmail.com, GitHub - github.com/chaitea321 (with 28+ stars on MeshWatch), LinkedIn - linkedin.com/in/eugene-vincent-42472024b, Portfolio - chai-homelab.com';
    }

    if (q.includes('llm') || q.includes('fine-tun') || q.includes('train')) {
      return 'I am actively training and fine-tuning LLMs on my local hardware for cost-effective AI. By running models like Ollama Phi-3 locally via Tailscale, I reduce inference costs, save time on manual analysis, and automate workflows. This approach eliminates per-token cloud API costs while maintaining full privacy of the data being processed.';
    }

    return 'I can provide detailed answers about my projects (MeshWatch, Minecraft monitoring, Monitoring Stack, Azure Functions, Career Portal), technical skills (Azure, Kubernetes, React, Python), cost optimization achievements (60% savings), or career background. Try asking about any of these topics for a comprehensive answer.';
  }

  // Get AI assistant status for UI display
  getStatus() {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const isAzureAvailable = origin.startsWith('http');
    
    return {
      azureProxy: isAzureAvailable ? 'Configured (awaiting deployment)' : 'N/A',
      tailscaleOllama: this.TAILSCALE_OLLAMA_URL || 'Not configured',
      model: this.DEFAULT_MODEL,
      status: isAzureAvailable ? 'Ready' : 'Not available'
    };
  }
}

export default AIAssistant;
