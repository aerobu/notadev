import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import { writeFiles, getCLIFilename } from '../src/writer.js';

const TEST_FILES = {
  'PRD.md': '# PRD\n\nContent',
  'ARCHITECTURE.md': '# Architecture\n\nContent',
};

afterEach(() => {
  for (const name of Object.keys(TEST_FILES)) {
    if (existsSync(name)) unlinkSync(name);
  }
  ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'].forEach(f => {
    if (existsSync(f)) unlinkSync(f);
  });
});

describe('getCLIFilename', () => {
  it('returns CLAUDE.md for claude binary', () => {
    expect(getCLIFilename({ binary: 'claude' })).toBe('CLAUDE.md');
  });

  it('returns GEMINI.md for gemini binary', () => {
    expect(getCLIFilename({ binary: 'gemini' })).toBe('GEMINI.md');
  });

  it('returns AGENTS.md for codex and opencode', () => {
    expect(getCLIFilename({ binary: 'codex' })).toBe('AGENTS.md');
    expect(getCLIFilename({ binary: 'opencode' })).toBe('AGENTS.md');
  });
});

describe('writeFiles', () => {
  it('writes all files to disk', async () => {
    await writeFiles(TEST_FILES, { binary: 'claude' });
    for (const name of Object.keys(TEST_FILES)) {
      expect(existsSync(name)).toBe(true);
    }
  });

  it('file content matches input', async () => {
    await writeFiles(TEST_FILES, { binary: 'claude' });
    expect(readFileSync('PRD.md', 'utf8')).toBe(TEST_FILES['PRD.md']);
  });

  it('renames CLAUDE.md to GEMINI.md when using gemini', async () => {
    const files = { ...TEST_FILES, 'CLAUDE.md': '# Context' };
    await writeFiles(files, { binary: 'gemini' });
    expect(existsSync('GEMINI.md')).toBe(true);
    expect(existsSync('CLAUDE.md')).toBe(false);
  });
});
