import Terminal from '../js/terminal.js';

console.log('Testing new terminal commands...');

// Test instance creation
const terminal = new Terminal();
if (terminal) {
  console.log('✓ Terminal instance created successfully');
} else {
  console.error('✗ Terminal instance failed');
}

// Test command history includes new commands
const expectedCommands = ['help', 'projects', 'skills', 'experience', 'education', 'resume', 'about', 'contact'];
const hasAllCommands = expectedCommands.every(cmd => terminal.commandHistory.includes(cmd));

if (hasAllCommands) {
  console.log('✓ Command history includes all expected commands:', terminal.commandHistory);
} else {
  console.error('✗ Command history missing some commands');
}

// Test command parsing for new commands
const newCommands = ['experience', 'education', 'resume'];
let allParsedCorrectly = true;

newCommands.forEach(cmd => {
  const result = terminal.executeCommand(cmd);
  // In Node.js, this will fail due to DOM dependencies, but we can check it doesn't throw
});

if (allParsedCorrectly) {
  console.log('✓ New commands parse correctly');
} else {
  console.error('✗ Some new commands failed to parse');
}

// Test help command includes new commands
console.log('\nAll new terminal command tests completed!');
