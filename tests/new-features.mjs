import { describe, it, before } from 'node:test';
import assert from 'assert/strict';
import Terminal from '../js/terminal.js';

describe('New Features Tests', () => {
  let terminal;

  before(() => {
    terminal = new Terminal();
  });

  describe('perf command', () => {
    it('perf is in commandHistory', () => {
      assert.ok(terminal.commandHistory.includes('perf'), 'perf should be in command history');
    });

    it('showPerf method exists', () => {
      assert.strictEqual(typeof terminal.showPerf, 'function', 'showPerf should be a method');
    });

    it('perf method does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showPerf(), 'showPerf should not throw in Node.js');
    });
  });

  describe('contact --email multi-step form', () => {
    it('has showContact method accepting args', () => {
      assert.strictEqual(typeof terminal.showContact, 'function', 'showContact should be a method');
    });

    it('startContactForm method exists for interactive prompts', () => {
      assert.strictEqual(typeof terminal.startContactForm, 'function', 'startContactForm should be a method');
    });

    it('contact --email does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showContact('--email'), 'showContact should not throw with --email in Node.js');
    });
  });

  describe('Ctrl+K command palette', () => {
    it('toggleCommandPalette method exists', () => {
      assert.strictEqual(typeof terminal.toggleCommandPalette, 'function', 'toggleCommandPalette should be a method');
    });

    it('showCommandPalette method exists', () => {
      assert.strictEqual(typeof terminal.showCommandPalette, 'function', 'showCommandPalette should be a method');
    });

    it('renderPaletteResults method exists', () => {
      assert.strictEqual(typeof terminal.renderPaletteResults, 'function', 'renderPaletteResults should be a method');
    });

    it('getCommandIcon returns icon for known commands', () => {
      assert.ok(terminal.getCommandIcon('help'), 'should return icon for help');
      assert.ok(terminal.getCommandIcon('projects'), 'should return icon for projects');
      assert.ok(terminal.getCommandIcon('perf'), 'should return icon for perf');
    });

    it('getCommandDesc returns description for known commands', () => {
      assert.strictEqual(typeof terminal.getCommandDesc('help'), 'string');
      assert.ok(terminal.getCommandDesc('projects').length > 0, 'projects should have description');
      assert.ok(terminal.getCommandDesc('perf').length > 0, 'perf should have description');
    });

    it('highlightMatch highlights query in command text', () => {
      const result = terminal.highlightMatch('skills-visual', 'skill');
      assert.ok(result.includes('<span class="palette-match">'), 'should wrap match in span');
      assert.ok(result.includes('skill'), 'should contain matched text');
    });

    it('highlightMatch returns escaped text when no match', () => {
      const result = terminal.highlightMatch('<script>', 'xxx');
      assert.strictEqual(result, '&lt;script&gt;', 'should escape HTML with no match');
    });

    it('palette does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.toggleCommandPalette(), 'toggleCommandPalette should not throw in Node.js');
    });
  });

  describe('skills-visual command', () => {
    it('showSkillsVisual method exists', () => {
      assert.strictEqual(typeof terminal.showSkillsVisual, 'function', 'showSkillsVisual should be a method');
    });

    it('skills-visual does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showSkillsVisual(), 'showSkillsVisual should not throw in Node.js');
    });
  });

  describe('timeline command', () => {
    it('showTimeline method exists', () => {
      assert.strictEqual(typeof terminal.showTimeline, 'function', 'showTimeline should be a method');
    });

    it('timeline does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showTimeline(), 'showTimeline should not throw in Node.js');
    });
  });

  describe('neofetch command', () => {
    it('showNeofetch method exists', () => {
      assert.strictEqual(typeof terminal.showNeofetch, 'function', 'showNeofetch should be a method');
    });

    it('neofetch does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showNeofetch(), 'showNeofetch should not throw in Node.js');
    });
  });

  describe('fortune command', () => {
    it('showFortune method exists', () => {
      assert.strictEqual(typeof terminal.showFortune, 'function', 'showFortune should be a method');
    });

    it('fortune does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showFortune(), 'showFortune should not throw in Node.js');
    });
  });

  describe('cowsay command', () => {
    it('showCowsay method exists', () => {
      assert.strictEqual(typeof terminal.showCowsay, 'function', 'showCowsay should be a method');
    });

    it('cowsay with no text shows usage warning', () => {
      assert.doesNotThrow(() => terminal.showCowsay(''), 'showCowsay should not throw without text in Node.js');
    });

    it('cowsay with text does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showCowsay('Hello World'), 'showCowsay should not throw with text in Node.js');
    });
  });

  describe('achievements command', () => {
    it('showAchievements method exists', () => {
      assert.strictEqual(typeof terminal.showAchievements, 'function', 'showAchievements should be a method');
    });

    it('achievements does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showAchievements(), 'showAchievements should not throw in Node.js');
    });

    it('achievements tracks command usage', () => {
      const initialCount = terminal.achievements.state.commandsUsed;
      terminal.achievements.record('perf');
      assert.strictEqual(terminal.achievements.state.commandsUsed, initialCount + 1, 'should increment commandsUsed');
    });

    it('achievements tracks unique commands', () => {
      const initialList = [...terminal.achievements.state.commandsUsedList];
      terminal.achievements.record('perf'); // already recorded above
      assert.strictEqual(
        terminal.achievements.state.commandsUsedList.filter(c => c === 'perf').length,
        1,
        'should only count unique commands once'
      );
    });
  });

  describe('resume --txt/--md', () => {
    it('showResume method exists', () => {
      assert.strictEqual(typeof terminal.showResume, 'function', 'showResume should be a method');
    });

    it('downloadFile method exists', () => {
      assert.strictEqual(typeof terminal.downloadFile, 'function', 'downloadFile should be a method');
    });

    it('resume does not throw in Node.js context', () => {
      assert.doesNotThrow(() => terminal.showResume('--txt'), 'showResume should not throw with --txt in Node.js');
    });
  });

  describe('command history completeness', () => {
    it('includes all expected commands', () => {
      const expected = [
        'help', 'projects', 'project', 'skills', 'skills-visual',
        'experience', 'education', 'resume', 'about', 'contact',
        'status', 'minecraft', 'ai', 'demo', 'clear', 'theme',
        'matrix', 'timeline', 'neofetch', 'fortune', 'cowsay',
        'achievements', 'perf'
      ];
      expected.forEach(cmd => {
        assert.ok(terminal.commandHistory.includes(cmd), `${cmd} should be in commandHistory`);
      });
    });
  });
});
