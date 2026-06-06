import VisualEffects from '../js/visual-effects.js';

console.log('Testing VisualEffects...');

// Test instance creation
const effects = new VisualEffects();
if (effects) {
  console.log('✓ VisualEffects instance created successfully');
} else {
  console.error('✗ VisualEffects instance failed');
}

// Test enabled state
if (typeof effects.enabled === 'boolean') {
  console.log('✓ Enabled state works:', effects.enabled);
} else {
  console.error('✗ Enabled state is not a boolean');
}

// Test toggle method exists and works
if (typeof effects.toggle === 'function') {
  const originalState = effects.enabled;
  effects.toggle();
  if (effects.enabled !== originalState) {
    console.log('✓ Toggle method works, state changed from', originalState, 'to', effects.enabled);
  } else {
    console.error('✗ Toggle did not change state');
  }
} else {
  console.error('✗ Toggle method not found');
}

// Test resize method exists
if (typeof effects.resize === 'function') {
  console.log('✓ Resize method exists');
} else {
  console.error('✗ Resize method not found');
}

console.log('\nAll VisualEffects tests completed!');
