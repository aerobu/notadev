import { describe, it, expect, vi } from 'vitest';
import { buildPrompt, parseGeneratedContent, SUPPORTED_FILES } from '../src/generate.js';

const mockAnswers = {
  description: 'A dashboard for tracking procurement orders',
  users: 'Procurement managers',
  features: 'Order tracking, supplier management, reporting',
  data: 'Orders, suppliers, line items',
  userFlow: 'Login, view dashboard, create order, track status',
  integrations: 'None',
  milestones: '3',
};

const mockStack = {
  label: 'Dashboard App',
  frontend: 'Next.js 14',
  backend: 'Next.js API Routes',
  database: 'PostgreSQL',
  orm: 'Prisma',
  auth: 'NextAuth.js',
  deployment: 'Vercel + Neon',
  rationale: 'Best for dashboards',
};

describe('SUPPORTED_FILES', () => {
  it('contains all 5 expected file names', () => {
    expect(SUPPORTED_FILES).toContain('PRD.md');
    expect(SUPPORTED_FILES).toContain('ARCHITECTURE.md');
    expect(SUPPORTED_FILES).toContain('DATA_MODEL.md');
    expect(SUPPORTED_FILES).toContain('MILESTONES.md');
    expect(SUPPORTED_FILES).toContain('CLAUDE.md');
  });
});

describe('buildPrompt', () => {
  it('returns a non-empty string for each file type', () => {
    for (const fileName of SUPPORTED_FILES) {
      const prompt = buildPrompt(fileName, mockAnswers, mockStack);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(50);
    }
  });

  it('includes the file name in the prompt', () => {
    const prompt = buildPrompt('PRD.md', mockAnswers, mockStack);
    expect(prompt).toContain('PRD.md');
  });

  it('handles null stack fields gracefully (custom stack rejection)', () => {
    const nullStack = {
      label: 'React + Firebase',
      frontend: null,
      database: null,
      orm: null,
      deployment: null,
      rationale: 'User-specified custom stack.',
      custom: true,
    };
    for (const fileName of SUPPORTED_FILES) {
      expect(() => buildPrompt(fileName, mockAnswers, nullStack)).not.toThrow();
    }
  });
});

describe('parseGeneratedContent', () => {
  it('strips leading/trailing whitespace', () => {
    expect(parseGeneratedContent('  # Title\n\nContent\n  ')).toBe('# Title\n\nContent');
  });

  it('returns content as-is when clean', () => {
    expect(parseGeneratedContent('# Title\n\nContent')).toBe('# Title\n\nContent');
  });
});
