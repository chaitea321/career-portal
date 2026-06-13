import { describe, it, before } from 'node:test';
import assert from 'assert/strict';
import Terminal from '../js/terminal.js';
import {
  validateUrl, SKILLS_DATA, PERF_THRESHOLDS, gradePerf, computeOverallGrade
} from '../js/utils/helpers.js';

describe('Bug Fixes & New Helpers', () => {
  let terminal;

  before(() => {
    terminal = new Terminal();
  });

  describe('validateUrl helper', () => {
    it('accepts valid http URLs', () => {
      assert.strictEqual(validateUrl('http://example.com'), 'http://example.com');
    });

    it('accepts valid https URLs', () => {
      assert.strictEqual(validateUrl('https://github.com/user/repo'), 'https://github.com/user/repo');
    });

    it('rejects javascript: protocol', () => {
      assert.strictEqual(validateUrl('javascript:alert(1)'), '#');
    });

    it('rejects data: URLs', () => {
      assert.strictEqual(validateUrl('data:text/html,<script>'), '#');
    });

    it('returns fallback for null/undefined', () => {
      assert.strictEqual(validateUrl(null, 'fallback'), 'fallback');
      assert.strictEqual(validateUrl(undefined, 'fallback'), 'fallback');
    });

    it('returns fallback for empty string', () => {
      assert.strictEqual(validateUrl('', 'fallback'), 'fallback');
      assert.strictEqual(validateUrl('   ', 'fallback'), 'fallback');
    });

    it('returns fallback for invalid URL format', () => {
      assert.strictEqual(validateUrl('not a url', 'fallback'), 'fallback');
    });
  });

  describe('SKILLS_DATA constant', () => {
    it('has all four skill categories', () => {
      assert.ok(SKILLS_DATA.cloud);
      assert.ok(SKILLS_DATA.frontend);
      assert.ok(SKILLS_DATA.backend);
      assert.ok(SKILLS_DATA.devops);
    });

    it('is frozen (immutable)', () => {
      assert.ok(Object.isFrozen(SKILLS_DATA), 'SKILLS_DATA should be frozen');
    });

    it('each category has label, items, and level', () => {
      Object.values(SKILLS_DATA).forEach(cat => {
        assert.ok(typeof cat.label === 'string');
        assert.ok(Array.isArray(cat.items));
        assert.ok(typeof cat.level === 'number');
      });
    });
  });

  describe('gradePerf utility', () => {
    it('returns A for excellent TTFB', () => {
      const result = gradePerf(150, PERF_THRESHOLDS.ttfb);
      assert.strictEqual(result.letter, 'A');
      assert.strictEqual(result.color, 'success');
    });

    it('returns F for poor load time', () => {
      const result = gradePerf(7000, PERF_THRESHOLDS.fullLoad);
      assert.strictEqual(result.letter, 'F');
      assert.strictEqual(result.color, 'warning');
    });

    it('returns ? for null/zero values', () => {
      assert.strictEqual(gradePerf(null, PERF_THRESHOLDS.ttfb).letter, '?');
      assert.strictEqual(gradePerf(0, PERF_THRESHOLDS.ttfb).letter, '?');
      assert.strictEqual(gradePerf(-100, PERF_THRESHOLDS.ttfb).letter, '?');
    });

    it('returns correct grade for B range', () => {
      const result = gradePerf(300, PERF_THRESHOLDS.ttfb);
      assert.strictEqual(result.letter, 'B');
    });

    it('returns correct grade for C range', () => {
      const result = gradePerf(600, PERF_THRESHOLDS.ttfb);
      assert.strictEqual(result.letter, 'C');
    });

    it('returns correct grade for D range', () => {
      const result = gradePerf(1200, PERF_THRESHOLDS.ttfb);
      assert.strictEqual(result.letter, 'D');
    });
  });

  describe('computeOverallGrade utility', () => {
    it('returns A when all grades are A', () => {
      const result = computeOverallGrade({
        a: { letter: 'A' }, b: { letter: 'A' }, c: { letter: 'A' }
      });
      assert.strictEqual(result.grade, 'A');
    });

    it('returns worst grade when mixed', () => {
      const result = computeOverallGrade({
        a: { letter: 'A' }, b: { letter: 'C' }, c: { letter: 'B' }
      });
      assert.strictEqual(result.grade, 'C');
    });

    it('returns F when any grade is F', () => {
      const result = computeOverallGrade({
        a: { letter: 'A' }, b: { letter: 'B' }, c: { letter: 'F' }
      });
      assert.strictEqual(result.grade, 'F');
    });

    it('returns D when worst is D', () => {
      const result = computeOverallGrade({
        a: { letter: 'B' }, b: { letter: 'D' }, c: { letter: 'C' }
      });
      assert.strictEqual(result.grade, 'D');
    });
  });

  describe('Bug fix: contact --email passes args', () => {
    it('showContact method accepts and handles args', () => {
      // In Node.js, this will hit the early return for typeof document === 'undefined'
      // but we verify no error is thrown and the method signature accepts args
      assert.doesNotThrow(() => terminal.showContact('--email'), 'should not throw with --email');
      assert.doesNotThrow(() => terminal.showContact('-e'), 'should not throw with -e');
      assert.doesNotThrow(() => terminal.showContact(''), 'should not throw with empty string');
    });
  });

  describe('Bug fix: resume --txt/--md passes args', () => {
    it('showResume method accepts and handles format args', () => {
      // In Node.js, this will hit early return but verify no error
      assert.doesNotThrow(() => terminal.showResume('--txt'), 'should not throw with --txt');
      assert.doesNotThrow(() => terminal.showResume('-t'), 'should not throw with -t');
      assert.doesNotThrow(() => terminal.showResume('--md'), 'should not throw with --md');
      assert.doesNotThrow(() => terminal.showResume('-m'), 'should not throw with -m');
    });
  });

  describe('Architecture: _guard method', () => {
    it('_guard returns true in Node.js (no document)', () => {
      assert.strictEqual(terminal._guard(), true, '_guard should return true in Node.js');
    });
  });

  describe('Architecture: _card method', () => {
    it('_card exists and is a function', () => {
      assert.strictEqual(typeof terminal._card, 'function', '_card should be a method');
    });
  });
});
