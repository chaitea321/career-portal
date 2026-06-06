class Terminal {
  constructor() {
    this.output = typeof document !== 'undefined' ? document.getElementById('terminal-output') : null;
    this.input = typeof document !== 'undefined' ? document.getElementById('command-input') : null;
    this.history = [];
    this.historyIndex = -1;
    this.commandHistory = ['help', 'projects', 'skills', 'experience', 'education', 'resume', 'about', 'contact'];
    this.announcementEl = null;
    
    this.init();
  }
  
  init() {
    if (this.output) {
      this.output.innerHTML = '';
    }
    this.setupAccessibility();
    this.typewriterEffect(
      '> Welcome to Chaitanya Kumar\'s portfolio terminal v1.0.0\n',
      () => this.typewriterEffect('> Type "help" to see available commands\n', () => this.bindEvents())
    );
  }
  
  setupAccessibility() {
    // Create live region for screen reader announcements
    if (typeof document !== 'undefined') {
      this.announcementEl = document.createElement('div');
      this.announcementEl.setAttribute('aria-live', 'polite');
      this.announcementEl.setAttribute('aria-atomic', 'true');
      this.announcementEl.className = 'sr-only';
      this.announcementEl.id = 'a11y-announcements';
      document.body.appendChild(this.announcementEl);
      
      // Trap focus in terminal for better keyboard experience
      if (this.output) {
        this.output.addEventListener('keydown', (e) => this.handleTerminalKeydown(e));
      }
    }
  }
  
  handleTerminalKeydown(e) {
    // Allow tab to move focus out of terminal
    if (e.key === 'Tab') {
      return; // Let default behavior handle tab navigation
    }
    
    // Arrow keys for command history when input is focused
    if (document.activeElement === this.input) {
      return; // Input handles its own arrow keys
    }
  }
  
  bindEvents() {
    if (typeof document !== 'undefined') {
      if (this.input) {
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        this.input.addEventListener('focus', () => this.input.scrollIntoView({ behavior: 'smooth' }));
        
        // Escape key focuses input for keyboard users
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && document.activeElement !== this.input) {
            e.preventDefault();
            this.input.focus();
            this.announceMessage('Command input focused');
          }
        });
      }
      window.addEventListener('resize', () => this.scrollToBottom());
    }
  }
  
  handleInput(e) {
    if (e.key === 'Enter') {
      const command = this.input.value.trim();
      if (command) {
        this.history.push(command);
        this.historyIndex = this.history.length;
        this.displayCommand(command);
        this.executeCommand(command);
      }
      this.input.value = '';
      this.scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.autocomplete();
    }
  }
  
  displayCommand(command) {
    if (typeof document === 'undefined' || !this.output) return;
    const line = document.createElement('div');
    line.className = 'output-line command';
    line.innerHTML = `<span class="prompt">$</span> ${command}`;
    this.output.appendChild(line);
  }
  
  executeCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
      case 'help':
        this.showHelp();
        break;
      case 'projects':
        this.showProjects(args);
        break;
      case 'skills':
        this.showSkills(args);
        break;
      case 'about':
        this.showAbout();
        break;
      case 'contact':
        this.showContact();
        break;
      case 'clear':
        if (typeof document !== 'undefined' && this.output) {
          this.output.innerHTML = '';
        }
        break;
      case 'theme':
        this.toggleTheme();
        break;
      case 'experience':
        this.showExperience(args);
        break;
      case 'education':
        this.showEducation(args);
        break;
      case 'resume':
        this.showResume();
        break;
      default:
        this.log(`Unknown command: ${cmd}`, 'warning');
    }
  }
  
  showHelp() {
    const helpText = [
      { cmd: 'help', desc: 'Show this help message' },
      { cmd: 'projects [filter]', desc: 'List GitHub projects (optional: filter by keyword)' },
      { cmd: 'skills [category]', desc: 'Show technical skills (optional: category)' },
      { cmd: 'experience [level]', desc: 'Show work experience (optional: level)' },
      { cmd: 'education', desc: 'Show education background' },
      { cmd: 'resume', desc: 'Download resume text format' },
      { cmd: 'about', desc: 'About Chaitanya Kumar' },
      { cmd: 'contact', desc: 'Contact information' },
      { cmd: 'clear', desc: 'Clear terminal output' },
      { cmd: 'theme', desc: 'Toggle synthwave theme' }
    ];
    
    // Accessibility shortcuts for keyboard users
    const a11yShortcuts = [
      { key: 'Tab', desc: 'Navigate between elements' },
      { key: '↑/↓', desc: 'Command history' },
      { key: 'Esc', desc: 'Focus input field' }
    ];
    
    this.log('\n=== AVAILABLE COMMANDS ===', 'info');
    helpText.forEach(({ cmd, desc }) => {
      this.log(`  ${cmd.padEnd(15)} - ${desc}`, 'success');
    });
    this.log('========================\n', 'info');
    
    // Show keyboard shortcuts for accessibility
    this.log('=== KEYBOARD SHORTCUTS ===', 'info');
    a11yShortcuts.forEach(({ key, desc }) => {
      this.log(`  ${key.padEnd(10)} - ${desc}`, 'success');
    });
    this.log('==========================\n', 'info');
  }
  
  showProjects(filter = '') {
    this.log('\n=== GITHUB PROJECTS ===\n', 'info');
    
    if (typeof document === 'undefined' || !this.output) return;
    
    const projects = [
      {
        name: 'CS211',
        description: 'Full-stack course management system with real-time updates',
        link: 'https://github.com/chaitea321/CS211',
        stars: 12,
        forks: 3
      },
      {
        name: 'minecraft-monitoring',
        description: 'Istio service mesh observability platform for Minecraft servers',
        link: 'https://github.com/chaitea321/minecraft-monitoring',
        stars: 28,
        forks: 7
      }
    ];
    
    const filtered = filter 
      ? projects.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || 
                            p.description.toLowerCase().includes(filter.toLowerCase()))
      : projects;
    
    if (filtered.length === 0) {
      this.log('No projects found matching criteria', 'warning');
    } else {
      filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'output-line project-card';
        card.innerHTML = `
          <div class="project-name">📦 ${project.name}</div>
          <div class="project-desc">${project.description}</div>
          <div>⭐ ${project.stars} stars | 🔀 ${project.forks} forks</div>
          <a href="${project.link}" target="_blank" class="project-link">View on GitHub →</a>
        `;
        this.output.appendChild(card);
      });
    }
    
    this.log('\n========================\n', 'info');
  }
  
  showSkills(category = '') {
    if (typeof document === 'undefined' || !this.output) return;
    this.log('\n=== TECHNICAL SKILLS ===\n', 'info');
    
    const skills = {
      cloud: [
        'Azure (Blob Storage, Functions, AKS)',
        'AWS (EC2, S3, Lambda)',
        'Cloudflare (DNS, CDN, Workers)',
        'Docker & Kubernetes (k3s, Istio)'
      ],
      frontend: [
        'React.js / Next.js',
        'TypeScript / JavaScript (ES6+)',
        'CSS3 / Tailwind / Material UI',
        'Progressive Web Apps'
      ],
      backend: [
        'Node.js / Express / NestJS',
        'Python (FastAPI, Django)',
        'GraphQL / REST APIs',
        'PostgreSQL / MongoDB / Redis'
      ],
      devops: [
        'GitHub Actions / CI/CD Pipelines',
        'Terraform / Infrastructure as Code',
        'Prometheus / Grafana / Loki',
        'OpenTelemetry / Distributed Tracing'
      ]
    };
    
    const categories = Object.keys(skills);
    const displayCategory = category ? category.toLowerCase() : null;
    
    categories.forEach(cat => {
      if (!displayCategory || cat === displayCategory) {
        this.log(`\n🔹 ${cat.toUpperCase()}`, 'success');
        skills[cat].forEach(skill => {
          this.log(`   • ${skill}`, 'info');
        });
      }
    });
    
    this.log('\n========================\n', 'info');
  }
  
  showAbout() {
    if (typeof document === 'undefined' || !this.output) return;
    const aboutText = [
      '',
      '👋 Hello! I\'m Chaitanya Kumar',
      '📍 Aurora, IL, USA',
      '',
      'Full Stack Engineer passionate about cloud-native architectures',
      'and developer experience. Currently building MeshWatch - a cost-',
      'optimized service mesh observability platform on k3s.',
      '',
      '🎯 What I do:',
      '   • Design scalable microservices with Istio & OpenTelemetry',
      '   • Build React/Next.js frontends with progressive enhancement',
      '   • Deploy serverless APIs on Azure/AWS',
      '   • Automate CI/CD pipelines with GitHub Actions',
      '',
      '💡 Recently:',
      '   • Integrated Ollama Phi-3 for automated incident analysis',
      '   • Reduced monitoring costs by 60% vs serverless alternatives',
      '   • Created FAANG-quality portfolio with synthwave terminal theme',
      '',
      '🎓 Currently exploring:',
      '   • WASM for browser-based compute',
      '   • Edge computing with Cloudflare Workers',
      '   • AI-powered DevOps (AIOps)',
      '',
      '========================\n'
    ];
    
    aboutText.forEach(line => {
      if (line.startsWith('🎯') || line.startsWith('💡') || line.startsWith('🎓')) {
        this.log(line, 'success');
      } else if (line.startsWith('   •') || line.startsWith('   •')) {
        this.log(line, 'info');
      } else {
        this.log(line, 'default');
      }
    });
  }
  
  showContact() {
    if (typeof document === 'undefined' || !this.output) return;
    this.log('\n=== CONTACT ===\n', 'info');
    this.log('📧 Email: chaitanya.kumar@example.com', 'success');
    this.log('🔗 GitHub: github.com/chaitea321', 'success');
    this.log('💼 LinkedIn: linkedin.com/in/chaitea321', 'success');
    this.log('🌐 Portfolio: chai-homelab.com', 'success');
    this.log('========================\n', 'info');
  }
  
  showExperience(level = '') {
    if (typeof document === 'undefined' || !this.output) return;
    this.log('\n=== WORK EXPERIENCE ===\n', 'info');
    
    const experience = [
      {
        role: 'Full Stack Engineer',
        company: 'Freelance / Personal Projects',
        period: '2023 - Present',
        level: 'senior',
        details: [
          'Built MeshWatch - cost-optimized service mesh observability on k3s',
          'Integrated Ollama Phi-3 for automated incident analysis',
          'Reduced monitoring costs by 60% vs serverless alternatives',
          'Deployed cloud-native architectures on Azure & AWS'
        ]
      },
      {
        role: 'DevOps Engineer',
        company: 'Personal Homelab Projects',
        period: '2022 - Present',
        level: 'mid',
        details: [
          'Managed k3s Kubernetes cluster with Istio service mesh',
          'Implemented Prometheus/Grafana/Loki monitoring stack',
          'Automated deployments with GitHub Actions CI/CD',
          'Configured Cloudflare DNS, CDN, and SSL termination'
        ]
      },
      {
        role: 'Software Engineering Intern',
        company: 'Academic Projects',
        period: '2023 - 2024',
        level: 'junior',
        details: [
          'Built full-stack web applications for coursework',
          'Developed real-time collaboration features',
          'Implemented RESTful APIs with Node.js and Express',
          'Created responsive frontends with React and TypeScript'
        ]
      }
    ];
    
    const filtered = level 
      ? experience.filter(e => e.level === level.toLowerCase())
      : experience;
    
    if (filtered.length === 0) {
      this.log(`No experience found for level: ${level}`, 'warning');
      this.log('Available levels: senior, mid, junior', 'info');
    } else {
      filtered.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'output-line project-card';
        card.innerHTML = `
          <div class="project-name">🏢 ${exp.role}</div>
          <div class="project-desc">${exp.company} | ${exp.period}</div>
          <ul style="list-style: none; padding-left: 1rem;">
            ${exp.details.map(d => `<li style="margin: 0.25rem 0;">   • ${d}</li>`).join('')}
          </ul>
        `;
        this.output.appendChild(card);
      });
    }
    
    this.log('\n========================\n', 'info');
  }
  
  showEducation() {
    if (typeof document === 'undefined' || !this.output) return;
    this.log('\n=== EDUCATION ===\n', 'info');
    
    const education = [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Illinois (CS211)',
        year: '2023 - 2024',
        details: [
          'Full-stack web development',
          'Data structures and algorithms',
          'Software engineering principles',
          'Database systems and cloud computing'
        ]
      },
      {
        degree: 'Certifications & Self-Study',
        institution: 'Online Platforms',
        year: '2022 - Present',
        details: [
          'Kubernetes Administration (CKA preparation)',
          'Cloud Architecture (Azure/AWS)',
          'DevOps best practices and CI/CD',
          'Service mesh with Istio and Linkerd'
        ]
      }
    ];
    
    education.forEach(edu => {
      const card = document.createElement('div');
      card.className = 'output-line project-card';
      card.innerHTML = `
        <div class="project-name">🎓 ${edu.degree}</div>
        <div class="project-desc">${edu.institution} | ${edu.year}</div>
        <ul style="list-style: none; padding-left: 1rem;">
          ${edu.details.map(d => `<li style="margin: 0.25rem 0;">   • ${d}</li>`).join('')}
        </ul>
      `;
      this.output.appendChild(card);
    });
    
    this.log('\n========================\n', 'info');
  }
  
  showResume() {
    if (typeof document === 'undefined' || !this.output) return;
    this.log('\n=== RESUME TEXT ===\n', 'info');
    
    const resumeText = `
CHAITANYA KUMAR
Full Stack Engineer | Kubernetes Enthusiast
📍 Aurora, IL, USA
📧 chaitanya.kumar@example.com
🔗 github.com/chaitea321
💼 linkedin.com/in/chaitea321

EMPLOYMENT HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Stack Engineer | Freelance / Personal Projects (2023 - Present)
  • Built MeshWatch - cost-optimized service mesh observability on k3s
  • Integrated Ollama Phi-3 for automated incident analysis
  • Reduced monitoring costs by 60% vs serverless alternatives
  • Deployed cloud-native architectures on Azure & AWS

DevOps Engineer | Personal Homelab Projects (2022 - Present)
  • Managed k3s Kubernetes cluster with Istio service mesh
  • Implemented Prometheus/Grafana/Loki monitoring stack
  • Automated deployments with GitHub Actions CI/CD
  • Configured Cloudflare DNS, CDN, and SSL termination

Software Engineering Intern | Academic Projects (2023 - 2024)
  • Built full-stack web applications for coursework
  • Developed real-time collaboration features
  • Implemented RESTful APIs with Node.js and Express
  • Created responsive frontends with React and TypeScript

EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B.S. Computer Science | University of Illinois (2023 - 2024)
  • Full-stack web development
  • Data structures and algorithms
  • Software engineering principles
  • Database systems and cloud computing

Certifications & Self-Study (2022 - Present)
  • Kubernetes Administration (CKA preparation)
  • Cloud Architecture (Azure/AWS)
  • DevOps best practices and CI/CD
  • Service mesh with Istio and Linkerd

SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cloud: Azure, AWS, Cloudflare, Docker, Kubernetes
Frontend: React.js, Next.js, TypeScript, CSS3, Tailwind
Backend: Node.js, Express, Python, FastAPI, GraphQL, REST
DevOps: GitHub Actions, Terraform, Prometheus, Grafana, Loki

PROJECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
meshwatch - Service mesh observability platform (⭐28)
  • Istio-based monitoring with real-time metrics
  • Cost-optimized vs serverless alternatives
  • AI-powered incident analysis with Ollama Phi-3

CS211 - Course management system (⭐12)
  • Full-stack web application with real-time updates
  • React frontend with Node.js/Express backend
  • PostgreSQL database with Redis caching

${'='.repeat(40)}
Generated from chai-homelab.com portfolio terminal
    `.trim();
    
    this.log(resumeText, 'default');
    this.log('\n💡 Tip: Copy this text or visit github.com/chaitea321 for PDF', 'info');
  }
  
  toggleTheme() {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('theme-retro');
    const isRetro = document.body.classList.contains('theme-retro');
    this.log(`\n${isRetro ? '✅' : '⚠️'} Theme toggled to ${isRetro ? 'retro' : 'synthwave'} mode`, 'info');
  }
  
  log(message, type = 'default') {
    if (typeof document === 'undefined' || !this.output) return;
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = message;
    this.output.appendChild(line);
    this.scrollToBottom();
    
    // Announce to screen readers (first and last lines only to avoid spam)
    if (this.announcementEl && message.trim() && !message.startsWith('   ')) {
      void this.announceMessage(message.trim());
    }
  }
  
  announceMessage(message) {
    if (this.announcementEl) {
      // Debounce announcements to avoid screen reader spam
      clearTimeout(this._announcementTimeout);
      this._announcementTimeout = setTimeout(() => {
        this.announcementEl.textContent = message;
      }, 300);
    }
  }
  
  typewriterEffect(text, callback) {
    if (typeof document === 'undefined' || !this.output) {
      if (callback) callback();
      return;
    }
    const line = document.createElement('div');
    line.className = 'output-line';
    this.output.appendChild(line);
    
    let i = 0;
    const speed = 2;
    
    const type = () => {
      if (i < text.length) {
        line.textContent += text.charAt(i);
        i++;
        this.scrollToBottom();
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    };
    
    type();
  }
  
  scrollToBottom() {
    if (typeof document === 'undefined' || !this.output) return;
    
    // Use requestAnimationFrame for smooth scrolling
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    
    this._rafId = requestAnimationFrame(() => {
      this.output.scrollTop = this.output.scrollHeight;
      this._rafId = null;
    });
  }
  
  autocomplete() {
    if (typeof document === 'undefined' || !this.input) return;
    const value = this.input.value;
    const matches = this.commandHistory.filter(cmd => 
      cmd.startsWith(value.toLowerCase())
    );
    
    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.log('\nMatches: ' + matches.join(', '), 'info');
    }
  }
}

export default Terminal;
