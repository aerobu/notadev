import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildPrompt, parseGeneratedContent, SUPPORTED_FILES, buildCLICommand, generateFiles } from '../src/generate.js';

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

vi.mock('../src/session.js', () => ({
  loadGeneratedFiles: vi.fn(async () => ({})),
  saveGeneratedFile: vi.fn(async () => {}),
}));

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

const mockCli = { binary: 'claude' };

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

  it('uses contextFilename in CLAUDE.md prompt when provided', () => {
    const prompt = buildPrompt('CLAUDE.md', mockAnswers, mockStack, 'GEMINI.md');
    expect(prompt).toContain('GEMINI.md');
  });

  it('defaults to CLAUDE.md in CLAUDE.md prompt when contextFilename is omitted', () => {
    const prompt = buildPrompt('CLAUDE.md', mockAnswers, mockStack);
    expect(prompt).toContain('CLAUDE.md');
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

describe('buildCLICommand', () => {
  it('returns correct command for claude', () => {
    const [bin, args] = buildCLICommand({ binary: 'claude' }, 'hello');
    expect(bin).toBe('claude');
    expect(args).toEqual(['-p', 'hello']);
  });

  it('returns correct command for gemini', () => {
    const [bin, args] = buildCLICommand({ binary: 'gemini' }, 'hello');
    expect(bin).toBe('gemini');
    expect(args).toEqual(['-p', 'hello']);
  });

  it('falls back to claude for unknown binary', () => {
    const [bin, args] = buildCLICommand({ binary: 'unknown' }, 'hello');
    expect(bin).toBe('claude');
    expect(args).toEqual(['-p', 'hello']);
  });
});

describe('generateFiles error conditions', () => {
  it('detects rate limits case-insensitively', () => {
    const msgs = ['Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 'rate limit reached'];
    for (const msg of msgs) {
      const isRateLimit = msg.toLowerCase().includes('rate limit') ||
                          msg.toLowerCase().includes('rate_limit');
      expect(isRateLimit).toBe(true);
    }
  });

  it('does not falsely detect rate limits for unrelated errors', () => {
    const msgs = ['network error', 'timeout', 'command not found'];
    for (const msg of msgs) {
      const isRateLimit = msg.toLowerCase().includes('rate limit') ||
                          msg.toLowerCase().includes('rate_limit');
      expect(isRateLimit).toBe(false);
    }
  });
});

describe('generateFiles', () => {
  let exitSpy;

  beforeEach(async () => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit called'); });
    // reset module mocks between tests
    const session = await import('../src/session.js');
    session.loadGeneratedFiles.mockReset();
    session.saveGeneratedFile.mockReset();
    session.loadGeneratedFiles.mockResolvedValue({});
    session.saveGeneratedFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('returns generated content for all files on success', async () => {
    const { execa } = await import('execa');
    execa.mockResolvedValue({ stdout: '# Generated Content' });

    const result = await generateFiles({ cli: mockCli, answers: mockAnswers, stack: mockStack });

    expect(Object.keys(result)).toHaveLength(SUPPORTED_FILES.length);
    for (const fileName of SUPPORTED_FILES) {
      expect(result[fileName]).toBe('# Generated Content');
    }
  });

  it('skips already-generated files from session', async () => {
    const { execa } = await import('execa');
    execa.mockResolvedValue({ stdout: '# New Content' });

    const session = await import('../src/session.js');
    session.loadGeneratedFiles.mockResolvedValue({ 'PRD.md': '# Cached PRD' });

    const result = await generateFiles({ cli: mockCli, answers: mockAnswers, stack: mockStack });

    expect(result['PRD.md']).toBe('# Cached PRD');
    // execa should only be called for the 4 remaining files
    expect(execa).toHaveBeenCalledTimes(4);
  });

  it('calls process.exit on rate limit error', async () => {
    const { execa } = await import('execa');
    const rateLimitErr = Object.assign(new Error('execa failed'), {
      stderr: 'Rate limit exceeded for this model',
      exitCode: 429,
      timedOut: false,
    });
    execa.mockRejectedValue(rateLimitErr);

    await expect(generateFiles({ cli: mockCli, answers: mockAnswers, stack: mockStack }))
      .rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('calls process.exit on rate_limit error (underscore variant)', async () => {
    const { execa } = await import('execa');
    const rateLimitErr = Object.assign(new Error('execa failed'), {
      stderr: 'RATE_LIMIT_EXCEEDED',
      exitCode: 429,
      timedOut: false,
    });
    execa.mockRejectedValue(rateLimitErr);

    await expect(generateFiles({ cli: mockCli, answers: mockAnswers, stack: mockStack }))
      .rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('calls process.exit on timeout', async () => {
    const { execa } = await import('execa');
    const timeoutErr = Object.assign(new Error('timed out'), {
      stderr: '',
      exitCode: undefined,
      timedOut: true,
    });
    execa.mockRejectedValue(timeoutErr);

    await expect(generateFiles({ cli: mockCli, answers: mockAnswers, stack: mockStack }))
      .rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('calls process.exit on generic error', async () => {
    const { execa } = await import('execa');
    const genericErr = Object.assign(new Error('command not found'), {
      stderr: 'bash: claude: command not found',
      exitCode: 127,
      timedOut: false,
    });
    execa.mockRejectedValue(genericErr);

    await expect(generateFiles({ cli: mockCli, answers: mockAnswers, stack: mockStack }))
      .rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
