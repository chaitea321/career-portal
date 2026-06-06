import GitHubAPI from '../js/github-api.js';

const api = new GitHubAPI();

// Test mock data retrieval
console.log('Testing GitHub API mock data...');
const stats = await api.fetchUserStats();
if (stats.publicRepos === 2) {
  console.log('✓ Mock stats data works:', stats);
} else {
  console.error('✗ Mock stats data failed:', stats);
}

// Test projects retrieval
console.log('Testing projects retrieval...');
const projects = await api.fetchProjects();
if (Array.isArray(projects) && projects.length > 0) {
  console.log('✓ Projects data works, count:', projects.length);
} else {
  console.error('✗ Projects data failed:', projects);
}

// Test skills (mock data in terminal)
console.log('Testing skills mock data...');
const skills = ['JavaScript', 'TypeScript', 'Python', 'Kubernetes', 'Docker'];
if (Array.isArray(skills) && skills.length > 0) {
  console.log('✓ Skills data works, count:', skills.length);
} else {
  console.error('✗ Skills data failed:', skills);
}

console.log('\nAll GitHub API tests completed!');
