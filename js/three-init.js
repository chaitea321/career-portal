// Centralized Three.js initialization — terminal page only
// Handles early bail on mobile/reduced-motion, prevents wasted CDN loads
//
// Usage (in HTML):
//   <script type="module">
//     import { initPageScene } from '/js/three-init.js?v=3';
//     initPageScene();
//   </script>

import ThreeManager from '/js/three-manager.js?v=3';
import { buildTerminalScene } from '/js/three-geometries.js?v=3';

/**
 * Initialize Three.js on the terminal page.
 * Skips entirely on mobile, reduced-motion, or when WebGL is unavailable.
 */
export async function initPageScene() {
  if (shouldSkipThree()) return;

  try {
    const three = new ThreeManager({ width: window.innerWidth, height: window.innerHeight });
    if (three.disabled) return;

    three.init();

    const scene = buildTerminalScene(three);
    for (const comp of scene.components) {
      three.addComponent(comp);
    }

    window.addEventListener('beforeunload', () => three.dispose(), { once: true });
  } catch (e) {
    console.warn('[Three.js] Initialization failed:', e.message);
  }
}

function shouldSkipThree() {
  if (window.innerWidth < 1024) return true;
  if (window.innerWidth < 360) return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (navigator.connection && navigator.connection.saveData) return true;
  return false;
}
