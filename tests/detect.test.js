import { describe, it, expect, vi } from 'vitest';
import { findInstalledCLIs, CLI_CONFIGS } from '../src/detect.js';

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
  it('returns an array', async () => {
    const result = await findInstalledCLIs();
    expect(Array.isArray(result)).toBe(true);
  });

  it('each result has name and binary', async () => {
    const result = await findInstalledCLIs();
    for (const cli of result) {
      expect(cli).toHaveProperty('name');
      expect(cli).toHaveProperty('binary');
    }
  });
});
