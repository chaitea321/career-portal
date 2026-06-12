/** Escape HTML entities to prevent XSS attacks (Node.js & browser compatible) */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') return String(str);

  // Prevent null byte injection attacks
  let escaped = str.replace(/\0/g, '');

  // Order matters: & must be first to avoid double-escaping
  return escaped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;'); // Prevent </script> injection
}

/** Normalize a search slug: lowercase, convert spaces to hyphens, collapse multiple hyphens */
export function normalizeSlug(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
}

/** Command palette data: icons and descriptions for all known commands */
export const COMMAND_ICONS = Object.freeze({
  help: '\u2753', projects: '\u{1f4ca}', project: '\u{1f4be}', skills: '\u{1f3af}',
  'skills-visual': '\u{1f4ca}', timeline: '\u{1f5d3}', experience: '\u{1f4bc}',
  education: '\u{1f393}', resume: '\u{1f4c4}', about: '\u{1f464}', contact: '\u{1f4e7}',
  status: '\u{1f504}', minecraft: '\u{1f3ae}', ai: '\u{1f916}', demo: '\u{1f3ac}',
  clear: '\u274c', theme: '\u{1f3b3}', matrix: '\u25a0', neofetch: '\u{1f5a1}',
  fortune: '\u{1f3ae}', cowsay: '\u{1f42e}', achievements: '\u{1f3af}', perf: '\u2699'
});

export const COMMAND_DESCS = Object.freeze({
  help: 'Show available commands', projects: 'List all projects', project: 'View project details',
  skills: 'Show technical skills', 'skills-visual': 'Animated skill bars', timeline: 'Project timeline',
  experience: 'Work experience', education: 'Education background', resume: 'Resume text',
  about: 'About Eugene', contact: 'Contact info', status: 'System metrics',
  minecraft: 'Minecraft server stats', ai: 'AI assistant', demo: 'Auto showcase',
  clear: 'Clear terminal', theme: 'Toggle theme', matrix: 'Matrix rain',
  neofetch: 'System info display', fortune: 'Random fortune', cowsay: 'ASCII cow',
  achievements: 'Earned badges', perf: 'Performance dashboard'
});

/** Highlight a query match within text, returning escaped HTML string */
export function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return escapeHtml(text);
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return `${escapeHtml(before)}<span class="palette-match">${escapeHtml(match)}</span>${escapeHtml(after)}`;
}

/** Build a single palette row item */
export function createPaletteItem(cmd, query) {
  const icon = COMMAND_ICONS[cmd] || '\u25aa';
  const desc = COMMAND_DESCS[cmd] || '';
  const highlightedCmd = highlightMatch(cmd, query);
  return { cmd, icon, desc, innerHTML: `
    <span class="palette-icon">${icon}</span>
    <span class="palette-cmd">${highlightedCmd}</span>
    <span class="palette-desc">${escapeHtml(desc)}</span>
  `};
}

/** Filter commands by query, sorted alphabetically */
export function filterCommands(commands, query) {
  const q = query.toLowerCase().trim();
  if (!q) return [...commands].sort();
  return commands.filter(cmd => cmd.includes(q)).sort();
}
