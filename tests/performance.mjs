import PerformanceMonitor from '../js/performance.js';

console.log('Testing PerformanceMonitor...');

// Test instance creation
const perfMonitor = new PerformanceMonitor();
if (perfMonitor) {
  console.log('✓ PerformanceMonitor instance created successfully');
} else {
  console.error('✗ PerformanceMonitor instance failed');
}

// Test mark method exists
if (typeof perfMonitor.mark === 'function') {
  console.log('✓ Mark method exists');
} else {
  console.error('✗ Mark method not found');
}

// Test measure method exists
if (typeof perfMonitor.measure === 'function') {
  console.log('✓ Measure method exists');
} else {
  console.error('✗ Measure method not found');
}

// Test reportMetrics method exists
if (typeof perfMonitor.reportMetrics === 'function') {
  console.log('✓ ReportMetrics method exists');
} else {
  console.error('✗ ReportMetrics method not found');
}

console.log('\nAll PerformanceMonitor tests completed!');
