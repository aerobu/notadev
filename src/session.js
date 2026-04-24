import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';

const SESSION_FILE = '.notadev-session.json';

export async function saveSession(data) {
  try {
    writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Could not save session: ${err.message}`);
    console.error('Check that the current directory is writable.');
  }
}

export async function loadSession() {
  if (!existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_FILE, 'utf8'));
  } catch {
    console.warn('Session file could not be read — starting fresh.');
    return null;
  }
}

export async function clearSession() {
  if (existsSync(SESSION_FILE)) unlinkSync(SESSION_FILE);
}
