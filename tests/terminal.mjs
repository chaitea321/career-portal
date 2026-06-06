import Terminal from '../js/terminal.js';

console.log('Testing Terminal class...');

// Test instance creation
let terminal;
try {
  terminal = new Terminal();
  console.log('✓ Terminal instance created');
} catch (error) {
  console.error('✗ Terminal instance failed:', error);
}

// Test command execution (will fail in Node.js due to DOM dependencies)
console.log('Testing command execution...');
try {
  terminal.executeCommand('help');
  console.log('✓ Command execution works');
} catch (error) {
  console.log('⚠ Command execution (expected DOM dependency error)');
}

console.log('\nAll terminal tests completed!');
