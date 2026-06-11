// Performance Monitor - Tracks real browser load metrics via Navigation Timing API
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.init();
  }
  
  init() {
    if (typeof performance === 'undefined' || typeof window === 'undefined') return;
    
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav) {
      console.warn('[PerformanceMonitor] Navigation Timing API not available');
      return;
    }
    
    this.metrics.set('TTFB', nav.responseEnd - nav.requestStart);
    this.metrics.set('DOMContentLoaded', nav.domContentLoadedEventEnd - nav.navigationStart);
    this.metrics.set('FullLoad', nav.loadEventEnd - nav.navigationStart);
    this.reportMetrics();
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
}

// Initialize performance monitor with error boundary if available
if (typeof window !== 'undefined') {
  try {
    const perfMonitor = new PerformanceMonitor();
    
    // Expose to global scope for debugging
    window.PerformanceMonitor = perfMonitor;
  } catch (error) {
    console.warn('[PerformanceMonitor] Failed to initialize:', error.message);
  }
}

export default PerformanceMonitor;
