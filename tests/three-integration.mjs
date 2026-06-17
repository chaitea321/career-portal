// Three.js 3D Integration Tests — File structure, source analysis, configuration
// Updated for purposeful 3D architecture (topology graph + metric gauges)

import { describe, it } from 'node:test';
import assert from 'assert/strict';
import * as fs from 'fs';
import * as path from 'path';

const JS_DIR = path.join(process.cwd(), 'js');
const ROOT = process.cwd();

describe('Three.js 3D Integration', () => {
  describe('File Structure', () => {
    it('has active three modules', () => {
      const expected = [
        'three-manager.js',
        'three-grid.js',
        'three-geometries.js',
        'three-init.js'
      ];
      for (const file of expected) {
        const fullPath = path.join(JS_DIR, file);
        assert.ok(fs.existsSync(fullPath), `Missing module: ${file}`);
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(content.length > 100, `${file} is too short (${content.length} chars)`);
      }
    });

    it('old/unused modules have been removed', () => {
      const removed = [
        'three-shapes.js',
        'three-particles.js',
        'three-interaction.js'
      ];
      for (const file of removed) {
        const fullPath = path.join(JS_DIR, file);
        assert.ok(!fs.existsSync(fullPath), `Should have removed: ${file}`);
      }
    });

    it('service-worker.js includes active three modules', () => {
      const swPath = path.join(JS_DIR, 'service-worker.js');
      const content = fs.readFileSync(swPath, 'utf8');
      assert.ok(content.includes('three-manager.js'), 'SW missing three-manager.js');
      assert.ok(content.includes('three-grid.js'), 'SW missing three-grid.js');
      assert.ok(content.includes('three-geometries.js'), 'SW missing three-geometries.js');
      assert.ok(content.includes('three-init.js'), 'SW missing three-init.js');
    });

    it('CSS includes three-canvas styles with correct z-index', () => {
      const cssPath = path.join(ROOT, 'css', 'styles.css');
      const content = fs.readFileSync(cssPath, 'utf8');
      assert.ok(content.includes('.three-canvas'), 'CSS missing .three-canvas selector');
      assert.ok(content.includes('z-index: 1'), 'Canvas should have z-index: 1');
    });

    it('only terminal and dashboard pages include Three.js init', () => {
      const with3D = ['index.html', 'dashboard.html'];
      const without3D = ['project-explorer.html', 'writeups.html', 'contact.html'];
      for (const page of with3D) {
        const content = fs.readFileSync(path.join(ROOT, page), 'utf8');
        assert.ok(content.includes('three-init.js'), `${page} should include three-init.js`);
        assert.ok(content.includes('initPageScene'), `${page} should call initPageScene`);
      }
      for (const page of without3D) {
        const content = fs.readFileSync(path.join(ROOT, page), 'utf8');
        assert.ok(!content.includes('three-init.js'), `${page} should NOT include three-init.js`);
        assert.ok(!content.includes('cdn.jsdelivr.net'), `${page} should NOT preconnect to jsdelivr CDN`);
      }
    });
  });

  describe('ThreeGeometries — Source Analysis', () => {
    it('exports only purposeful geometry factories and scene builders', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-geometries.js'), 'utf8');
      // New purposeful exports
      assert.ok(content.includes('createTopologyGraph'), 'Should export topology graph');
      assert.ok(content.includes('createMetricGauges'), 'Should export metric gauges');
      assert.ok(content.includes('buildTerminalScene'), 'Should export terminal scene builder');
      assert.ok(content.includes('buildDashboardScene'), 'Should export dashboard scene builder');
      // Removed exports
      assert.ok(!content.includes('createFlowField'), 'Should NOT export flow field (removed)');
      assert.ok(!content.includes('createHoneycombLattice'), 'Should NOT export honeycomb (removed)');
      assert.ok(!content.includes('createPrismMatrix'), 'Should NOT export prism matrix (removed)');
      assert.ok(!content.includes('createWaveSurface'), 'Should NOT export wave surface (removed)');
      assert.ok(!content.includes('createTerminalNebula'), 'Should NOT export nebula (removed)');
      assert.ok(!content.includes('buildProjectExplorerScene'), 'Should NOT export project scene (removed)');
      assert.ok(!content.includes('buildWriteupsScene'), 'Should NOT export writeups scene (removed)');
      assert.ok(!content.includes('buildContactScene'), 'Should NOT export contact scene (removed)');
    });

    it('topology graph includes infrastructure service definitions', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-geometries.js'), 'utf8');
      assert.ok(content.includes('TOPO'), 'Should have static topology config');
      assert.ok(content.includes('meshwatch'), 'Should include MeshWatch service');
      assert.ok(content.includes('prometheus'), 'Should include Prometheus');
      assert.ok(content.includes('grafana'), 'Should include Grafana');
      assert.ok(content.includes('istio'), 'Should include Istio');
      assert.ok(content.includes('minecraft'), 'Should include Minecraft');
    });

    it('metric gauges support setData() for live data binding', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-geometries.js'), 'utf8');
      assert.ok(content.includes('setData(data)'), 'Gauges should have setData method');
      assert.ok(content.includes('targetValue'), 'Gauges should animate toward target values');
    });

    it('imports createGrid from three-grid.js', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-geometries.js'), 'utf8');
      assert.ok(content.includes("import createGrid from './three-grid.js'"), 'Should import grid');
    });

    it('each geometry uses init(manager) pattern for mouse access', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-geometries.js'), 'utf8');
      assert.ok(content.includes('init(manager)'), 'Topology graph should have init(manager)');
    });
  });

  describe('ThreeInit — Centralized Module', () => {
    it('supports onReady callback for scene data binding', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-init.js'), 'utf8');
      assert.ok(content.includes('onReady'), 'Should support onReady callback parameter');
    });

    it('only maps terminal and dashboard scene builders', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-init.js'), 'utf8');
      assert.ok(content.includes("terminal: buildTerminalScene"), 'Should map terminal');
      assert.ok(content.includes("dashboard: buildDashboardScene"), 'Should map dashboard');
    });

    it('skips on mobile, reduced-motion, and reduced-data', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-init.js'), 'utf8');
      assert.ok(content.includes('< 1024'), 'Should skip on mobile width');
      assert.ok(content.includes('prefers-reduced-motion'), 'Should skip on reduced motion');
      assert.ok(content.includes('saveData'), 'Should skip on reduced data mode');
    });

    it('has try-catch error boundary', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-init.js'), 'utf8');
      assert.ok(content.includes('try {'), 'Should have try-catch');
      assert.ok(content.includes('catch'), 'Should have catch block');
      assert.ok(content.includes('console.warn'), 'Should warn on error');
    });

    it('has beforeunload cleanup', () => {
      const content = fs.readFileSync(path.join(JS_DIR, 'three-init.js'), 'utf8');
      assert.ok(content.includes('beforeunload'), 'Should have beforeunload cleanup');
      assert.ok(content.includes('.dispose()'), 'Should call dispose on unload');
    });
  });

  describe('Dashboard Integration', () => {
    it('dashboard.html calls initPageScene with scene callback', () => {
      const content = fs.readFileSync(path.join(ROOT, 'dashboard.html'), 'utf8');
      assert.ok(content.includes("initPageScene('dashboard'"), 'Should init dashboard scene');
      assert.ok(content.includes('window._threeGauges'), 'Should expose gauges globally for live data');
    });

    it('dashboard.html pushes live data to 3D gauges', () => {
      const content = fs.readFileSync(path.join(ROOT, 'dashboard.html'), 'utf8');
      assert.ok(content.includes('_threeGauges.setData'), 'Should call setData with metrics');
    });
  });

  describe('CDN Import Consistency', () => {
    it('active modules use same Three.js CDN version', () => {
      const modules = ['three-manager.js', 'three-grid.js', 'three-geometries.js'];
      const version = '0.160.0';
      for (const mod of modules) {
        const content = fs.readFileSync(path.join(JS_DIR, mod), 'utf8');
        assert.ok(content.includes(version), `${mod} should use Three.js v${version}`);
      }
    });
  });

  describe('Code Quality', () => {
    it('no console.log in production code (only warn/error)', () => {
      const modules = ['three-manager.js', 'three-grid.js', 'three-geometries.js', 'three-init.js'];
      for (const mod of modules) {
        const content = fs.readFileSync(path.join(JS_DIR, mod), 'utf8');
        const logMatches = content.match(/console\.log\(/g);
        assert.strictEqual(logMatches, null, `${mod} should not use console.log`);
      }
    });
  });
});
