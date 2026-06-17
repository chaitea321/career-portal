// Centralized Three.js initialization — shared across pages that use 3D
// Handles early bail on mobile/reduced-motion, prevents wasted CDN loads
//
// Usage (in HTML):
//   <script type="module">
//     import { initPageScene } from '/js/three-init.js?v=3';
//
//     // For dashboard, pass a callback to get gauge ref for live data updates:
//     initPageScene('dashboard', (scene) => {
//       window._threeGauges = scene.gauges; // exposed for live data binding
//     });
//   </script>

import ThreeManager from '/js/three-manager.js?v=3';
import { buildTerminalScene, buildDashboardScene } from '/js/three-geometries.js?v=3';

const SCENE_BUILDERS = {
  terminal: buildTerminalScene,
  dashboard: buildDashboardScene
};

/**
 * Initialize Three.js for a specific page.
 * Skips entirely on mobile, reduced-motion, or when WebGL is unavailable.
 *
 * @param {'terminal'|'dashboard'} page
 * @param {(scene: object) => void} [onReady] — callback receiving the built scene (for data binding)
 */
export async function initPageScene(page, onReady) {
  // Early bail: mobile screens, reduced motion, or tiny viewports
  if (shouldSkipThree()) return;

  try {
    const three = new ThreeManager({
      width: window.innerWidth,
      height: window.innerHeight
    });

    if (three.disabled) return;

    three.init();

    const builder = SCENE_BUILDERS[page];
    if (!builder) {
      console.warn('[Three.js] Unknown page:', page);
      return;
    }

    const scene = builder(three);
    for (const comp of scene.components) {
      three.addComponent(comp);
    }

    if (onReady) onReady(scene);

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
