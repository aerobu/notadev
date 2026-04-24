import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';

const SESSION_FILE = '.notadev-session.json';

export async function saveSession(data) {
  writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
}

export async function loadSession() {
  if (!existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export async function clearSession() {
  if (existsSync(SESSION_FILE)) unlinkSync(SESSION_FILE);
}
