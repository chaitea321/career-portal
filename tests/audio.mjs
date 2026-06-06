import audioController from '../js/audio.js';

console.log('Testing AudioController...');

// Test instance creation
if (audioController) {
  console.log('✓ AudioController instance created');
} else {
  console.error('✗ AudioController instance failed');
  process.exit(1);
}

// Test enabled state
console.log('Testing enabled state...');
if (typeof audioController.enabled === 'boolean') {
  console.log('✓ Enabled state works:', audioController.enabled);
} else {
  console.error('✗ Enabled state failed');
}

// Test sound effect method
console.log('Testing sound effect...');
try {
  audioController.handleInput('a');
  console.log('✓ Sound effect method works');
} catch (error) {
  console.error('✗ Sound effect failed:', error);
}

console.log('\nAll audio tests completed!');
