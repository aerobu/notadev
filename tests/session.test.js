import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { loadSession, saveSession, clearSession } from '../src/session.js';

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
