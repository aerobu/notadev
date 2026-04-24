import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// vi.mock is hoisted to the top of the module by vitest — safe to reference vi.fn() here
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

import { findInstalledCLIs, detectCLI, CLI_CONFIGS } from '../src/detect.js';
import { execSync } from 'child_process';

describe('CLI_CONFIGS', () => {
  it('defines claude, gemini, codex, and opencode', () => {
    const names = CLI_CONFIGS.map(c => c.name);
    expect(names).toContain('Claude Code');
    expect(names).toContain('Gemini CLI');
    expect(names).toContain('Codex');
    expect(names).toContain('OpenCode');
  });

  it('each config has name, binary, and testFlag fields', () => {
    for (const config of CLI_CONFIGS) {
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('binary');
      expect(config).toHaveProperty('testFlag');
    }
  });
});

describe('findInstalledCLIs', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns only CLIs whose binary succeeds (claude only)', () => {
    execSync.mockImplementation((cmd) => {
      if (cmd.startsWith('claude')) return;
      throw new Error('not found');
    });

    const result = findInstalledCLIs();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].binary).toBe('claude');
    expect(result[0].name).toBe('Claude Code');
  });

  it('returns empty array when all binaries throw', () => {
    execSync.mockImplementation(() => {
      throw new Error('not found');
    });

    const result = findInstalledCLIs();
    expect(result).toHaveLength(0);
  });
});

describe('detectCLI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls process.exit(1) when finder returns empty array', async () => {
    // Make exit throw so detectCLI doesn't continue into inquirer
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(detectCLI(async () => [])).rejects.toThrow('process.exit(1)');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('returns the single CLI when finder returns exactly one', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const claudeConfig = { name: 'Claude Code', binary: 'claude', testFlag: '--version' };

    const result = await detectCLI(async () => [claudeConfig]);

    expect(result).toEqual(claudeConfig);

    consoleSpy.mockRestore();
  });
});
