import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { loadSession, saveSession, clearSession, saveGeneratedFile, loadGeneratedFiles } from '../src/session.js';

const SESSION_FILE = '.notadev-session.json';

beforeEach(() => {
  if (existsSync(SESSION_FILE)) unlinkSync(SESSION_FILE);
});

afterEach(() => {
  if (existsSync(SESSION_FILE)) unlinkSync(SESSION_FILE);
});

describe('saveSession', () => {
  it('writes session data to .notadev-session.json', async () => {
    await saveSession({ cli: 'claude', answers: { description: 'test' }, stack: {} });
    expect(existsSync(SESSION_FILE)).toBe(true);
  });
});

describe('loadSession', () => {
  it('returns null when no session file exists', async () => {
    const result = await loadSession();
    expect(result).toBeNull();
  });

  it('returns parsed session when file exists', async () => {
    const data = { cli: 'claude', answers: { description: 'test' }, stack: {} };
    writeFileSync(SESSION_FILE, JSON.stringify(data));
    const result = await loadSession();
    expect(result).toEqual(data);
  });
});

describe('clearSession', () => {
  it('removes the session file', async () => {
    writeFileSync(SESSION_FILE, '{}');
    await clearSession();
    expect(existsSync(SESSION_FILE)).toBe(false);
  });

  it('does not throw if no session file exists', async () => {
    await expect(clearSession()).resolves.not.toThrow();
  });
});

describe('saveGeneratedFile', () => {
  it('persists a single generated file into session', async () => {
    await saveGeneratedFile('PRD.md', '# PRD Content');
    const session = await loadSession();
    expect(session.generatedFiles['PRD.md']).toBe('# PRD Content');
  });

  it('accumulates multiple generated files without overwriting others', async () => {
    await saveGeneratedFile('PRD.md', '# PRD');
    await saveGeneratedFile('ARCHITECTURE.md', '# ARCH');
    const session = await loadSession();
    expect(session.generatedFiles['PRD.md']).toBe('# PRD');
    expect(session.generatedFiles['ARCHITECTURE.md']).toBe('# ARCH');
  });

  it('merges into existing session data without losing other fields', async () => {
    await saveSession({ cli: 'claude', answers: { description: 'test' }, stack: {} });
    await saveGeneratedFile('PRD.md', '# PRD');
    const session = await loadSession();
    expect(session.cli).toBe('claude');
    expect(session.generatedFiles['PRD.md']).toBe('# PRD');
  });
});

describe('loadGeneratedFiles', () => {
  it('returns an empty object when no session file exists', async () => {
    const result = await loadGeneratedFiles();
    expect(result).toEqual({});
  });

  it('returns an empty object when session has no generatedFiles key', async () => {
    await saveSession({ cli: 'claude', answers: {}, stack: {} });
    const result = await loadGeneratedFiles();
    expect(result).toEqual({});
  });

  it('returns the generatedFiles map when present in session', async () => {
    await saveSession({ generatedFiles: { 'PRD.md': '# PRD', 'CLAUDE.md': '# CLAUDE' } });
    const result = await loadGeneratedFiles();
    expect(result['PRD.md']).toBe('# PRD');
    expect(result['CLAUDE.md']).toBe('# CLAUDE');
  });
});
