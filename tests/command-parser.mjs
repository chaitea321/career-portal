import CommandParser from '../js/command-parser.js';

const parser = new CommandParser();

// Test basic command parsing
console.log('Testing basic command parsing...');
let result = parser.parse('help');
if (result.command === 'help' && !result.arguments?.length) {
  console.log('✓ Basic command parsing works');
} else {
  console.error('✗ Basic command parsing failed:', result);
}

// Test command with arguments
console.log('Testing command with arguments...');
result = parser.parse('projects --filter=react');
if (result.command === 'projects' && result.arguments?.includes('--filter=react')) {
  console.log('✓ Command with arguments works');
} else {
  console.error('✗ Command with arguments failed:', result);
}

// Test empty command
console.log('Testing empty command...');
result = parser.parse('');
if (result.command === '' && !result.arguments?.length) {
  console.log('✓ Empty command parsing works');
} else {
  console.error('✗ Empty command parsing failed:', result);
}

// Test whitespace handling
console.log('Testing whitespace handling...');
result = parser.parse('  about  ');
if (result.command === 'about') {
  console.log('✓ Whitespace trimming works');
} else {
  console.error('✗ Whitespace trimming failed:', result);
}

console.log('\nAll tests completed!');
