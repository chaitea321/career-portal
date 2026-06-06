// Performance Monitor - Tracks load times and renders metrics
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.init();
  }
  
  init() {
    if (typeof performance === 'undefined' || typeof window === 'undefined') return;
    
    // Mark initial paint
    if (performance.mark) {
      performance.mark('portfolio-init-start');
      
      window.addEventListener('load', () => {
        performance.mark('portfolio-load-end');
        this.measure('pageLoad', 'portfolio-init-start', 'portfolio-load-end');
        this.reportMetrics();
      });
    }
  }
  
  mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }
  
  measure(name, start, end) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, start, end);
        const entries = performance.getEntriesByName(name);
        if (entries.length > 0) {
          this.metrics.set(name, entries[0].duration);
        }
      } catch (error) {
        // Ignore measure errors
      }
    }
  }
  
  reportMetrics() {
    if (typeof console === 'undefined') return;
    
    const metrics = [];
    this.metrics.forEach((value, key) => {
      metrics.push(`${key}: ${value.toFixed(2)}ms`);
    });
    
    if (metrics.length > 0) {
      console.log('📊 Performance Metrics:', metrics.join(' | '));
    }
  }
  
  // Measure DOM content loaded time
  measureDOMContentLoaded() {
    this.mark('dom-content-loaded');
    
    const observer = new PerformanceObserver((entries) => {
      entries.forEach(entry => {
        if (entry.name === 'dom-content-loaded') {
          console.log(`⚡ DOM Content Loaded: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    try {
      observer.observe({ type: 'resource' });
    } catch (error) {
      // Ignore observer errors
    }
  }
}

// Initialize performance monitor if available
if (typeof window !== 'undefined') {
  const perfMonitor = new PerformanceMonitor();
  
  // Expose to global scope for debugging
  window.PerformanceMonitor = perfMonitor;
}

export default PerformanceMonitor;
