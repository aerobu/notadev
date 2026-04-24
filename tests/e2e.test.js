import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync } from 'fs';
import { loadSession, saveSession, clearSession } from '../src/session.js';
import { recommendStack } from '../src/recommend.js';
import { buildPrompt, SUPPORTED_FILES } from '../src/generate.js';
import { getCLIFilename } from '../src/writer.js';

const mockAnswers = {
  description: 'A procurement dashboard showing order status and supplier data',
  users: 'Procurement managers at mid-size companies',
  features: 'Order tracking, supplier list, spend reports',
  data: 'Orders, suppliers, line items, users',
  userFlow: 'Login, see dashboard, click order, view details, export PDF',
  integrations: 'None',
  milestones: '3',
};

afterEach(async () => {
  await clearSession();
});

describe('end-to-end pipeline', () => {
  it('produces a stack from answers', () => {
    const stack = recommendStack(mockAnswers);
    expect(stack.label).toBe('Dashboard App');
  });

  it('builds a non-empty prompt for every file', () => {
    const stack = recommendStack(mockAnswers);
    for (const fileName of SUPPORTED_FILES) {
      const prompt = buildPrompt(fileName, mockAnswers, stack);
      expect(prompt.length).toBeGreaterThan(100);
    }
  });

  it('session round-trip works', async () => {
    const stack = recommendStack(mockAnswers);
    await saveSession({ cli: { binary: 'claude' }, answers: mockAnswers, stack });
    const loaded = await loadSession();
    expect(loaded.cli.binary).toBe('claude');
    expect(loaded.answers.description).toBe(mockAnswers.description);
  });

  it('getCLIFilename maps correctly for all CLIs', () => {
    expect(getCLIFilename({ binary: 'claude' })).toBe('CLAUDE.md');
    expect(getCLIFilename({ binary: 'gemini' })).toBe('GEMINI.md');
    expect(getCLIFilename({ binary: 'codex' })).toBe('AGENTS.md');
    expect(getCLIFilename({ binary: 'opencode' })).toBe('AGENTS.md');
  });

  it('procurement dashboard is classified as dashboard type', () => {
    const stack = recommendStack(mockAnswers);
    expect(stack.database).toBe('PostgreSQL');
    expect(stack.deployment).toContain('Vercel');
  });
});
