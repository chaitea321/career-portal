// Synthwave Visual Effects Controller
class VisualEffects {
  constructor() {
    this.enabled = true;
    this.matrixColumns = [];
    this.init();
  }
  
  init() {
    if (typeof document === 'undefined') return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      this.enabled = false;
      return;
    }
    
    // Lazy initialize after page load for better performance
    if (document.readyState === 'complete') {
      this.createMatrixRain();
      this.addNeonPulse();
    } else {
      window.addEventListener('load', () => {
        this.createMatrixRain();
        this.addNeonPulse();
      });
    }
  }
  
  createMatrixRain() {
    if (!this.enabled || !document.body) return;
    
    // Remove existing columns
    document.querySelectorAll('.matrix-column').forEach(col => col.remove());
    
    const columnCount = Math.floor(window.innerWidth / 50);
    
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.setProperty('--x', `${i * 50}px`);
      column.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
      column.style.animationDelay = `${Math.random() * 3}s`;
      
      document.body.appendChild(column);
      this.matrixColumns.push(column);
    }
  }
  
  addNeonPulse() {
    if (!this.enabled || !document.body) return;
    
    // Add subtle neon pulse to header elements
    const header = document.querySelector('.terminal-header');
    if (header) {
      header.classList.add('neon-pulse');
    }
  }
  
  resize() {
    if (!this.enabled) return;
    this.createMatrixRain();
  }
  
  toggle() {
    this.enabled = !this.enabled;
    
    if (typeof document !== 'undefined') {
      if (this.enabled) {
        this.init();
      } else {
        document.querySelectorAll('.matrix-column').forEach(col => col.remove());
        const header = document.querySelector('.terminal-header');
        if (header) {
          header.classList.remove('neon-pulse');
        }
      }
    }
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portfolio-visual-effects', this.enabled);
    }
  }
  
  loadPreference() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('portfolio-visual-effects');
      if (saved === 'false') {
        this.enabled = false;
        document.querySelectorAll('.matrix-column').forEach(col => col.remove());
      }
    }
  }
}

// Initialize visual effects when DOM is ready
if (typeof document !== 'undefined') {
  const visualEffects = new VisualEffects();
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => visualEffects.resize(), 250);
  });
}

export default VisualEffects;
