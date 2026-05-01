import { execa } from 'execa';
import chalk from 'chalk';
import { saveGeneratedFile, loadGeneratedFiles } from './session.js';
import { getCLIFilename } from './writer.js';

export const STANDARD_FILES = ['PRD.md', 'ARCHITECTURE.md', 'DATA_MODEL.md', 'MILESTONES.md', 'CLAUDE.md'];

export const ENHANCED_FILES = [
  ...STANDARD_FILES,
  'MEMORY.md',
  '.claude/rules/CONVENTIONS.md',
  '.claude/rules/SECURITY.md',
  '.claude/agents/code-reviewer.md',
  '.claude/skills/run-evals/SKILL.md',
  '.claude/skills/session-handoff/SKILL.md',
  '/golden/README.md',
];

// These are conditionally generated based on options
export const CONDITIONAL_ENHANCED = {
  'research-agent': { condition: (opts) => opts.teamSize !== 'solo' },
  'context-audit': { condition: (opts) => opts.teamSize !== 'solo' },
  'auto-code-review-hook': { condition: (opts) => opts.autoCodeReview === true },
  'block-dangerous-ops-hook': { condition: (opts) => opts.criticality === 'critical' },
};

export function buildPrompt(fileName, answers, stack, contextFilename = 'CLAUDE.md') {
  const techLine = stack.custom
    ? `Tech stack: ${stack.label} (user-specified)`
    : `Tech stack: ${stack.label} — ${stack.frontend ?? 'N/A'}, ${stack.database ?? 'N/A'} via ${stack.orm ?? 'N/A'}, deployed on ${stack.deployment ?? 'N/A'}`;

  const context = `
Project description: ${answers.description}
Target users: ${answers.users}
Core features: ${answers.features}
Data to store: ${answers.data}
User flow: ${answers.userFlow}
Integrations: ${answers.integrations}
Number of milestones: ${answers.milestones}
${techLine}
Stack rationale: ${stack.rationale}
`.trim();

  const prompts = {
    'PRD.md': `You are a senior product manager. Generate a production-quality PRD.md file for the following project. Include: problem statement, target users, core features (numbered list), explicitly out-of-scope items, and success metrics. Use markdown. Be specific and actionable.\n\n${context}`,

    'ARCHITECTURE.md': `You are a senior software architect. Generate a production-quality ARCHITECTURE.md file. Include: recommended tech stack with rationale, folder structure (as a tree), component breakdown, key npm dependencies with versions, and required environment variables. Use the stack provided. Use markdown.\n\n${context}`,

    'DATA_MODEL.md': `You are a senior backend engineer. Generate a production-quality DATA_MODEL.md file. Include: all entities with their fields and types, relationships between entities (one-to-many, many-to-many etc.), a text-format ERD using markdown tables, and indexing recommendations. Use markdown.\n\n${context}`,

    'MILESTONES.md': `You are a senior engineering manager. Generate a MILESTONES.md file with exactly ${answers.milestones} milestones. Each milestone must have: a title, a goal statement, a list of features/tasks to complete, and a clear definition of done. Milestone 1 should cover project setup and core data layer. Final milestone should include polish and any integrations. Use markdown.\n\n${context}`,

    'CLAUDE.md': `You are a senior engineering lead. Generate a ${contextFilename} file that acts as a behavioral contract for an AI coding assistant working on this project. Include these exact rules:
1. Read PRD.md, ARCHITECTURE.md, DATA_MODEL.md, and MILESTONES.md before writing any code.
2. Always write tests before implementation (TDD). Never skip tests.
3. Do not begin a new milestone until the current milestone's definition of done is fully met. Ask the user to confirm before proceeding.
4. Do not deviate from the tech stack in ARCHITECTURE.md without asking the user first.
5. Do not invent new database tables or fields not in DATA_MODEL.md without asking first.
6. Keep all code changes small and focused. Commit after each milestone task.
Also include a project summary section so the assistant has context on startup.\n\n${context}`,

    'MEMORY.md': `You are a senior engineering lead. Generate a MEMORY.md file that serves as a session handoff template for an AI coding assistant. Include sections for: Architecture, Recently Changed (last 30 days), Active Work (PRs in review, in progress tasks, blockers), and Known Issues. This file should be updated by the assistant at the end of each session to capture progress, new learnings, and next steps. Use markdown.\n\n${context}`,

    '.claude/rules/CONVENTIONS.md': `You are a senior engineer establishing team standards. Generate a CONVENTIONS.md file for the .claude/rules/ directory. Include: code formatting standards (language-specific for ${stack.frontend ?? 'the chosen frontend'} and backend), naming conventions, testing requirements (test-first, minimum coverage %), commit message format, error message standards (e.g., "Max tokens exceeded, try summarizing" not "400 Bad Request"), and a code review checklist. Be specific and verifiable. Use markdown.\n\n${context}`,

    '.claude/rules/SECURITY.md': `You are a security architect. Generate a SECURITY.md file for the .claude/rules/ directory. Include: sandboxing requirements (process isolation for code execution, network egress controls), what operations are never allowed, secret scoping and handling, auth boundaries between agent and tools, and MCP server requirements. Be explicit about what is blocked and why. Use markdown.\n\n${context}`,

    '.claude/agents/code-reviewer.md': `You are an expert code reviewer. Generate a code-reviewer.md agent definition in YAML frontmatter format with a system prompt. The agent should review code for: security issues (injection, auth bypass, data exposure), test coverage, error message quality (actionable, not generic HTTP codes), and context accuracy. The output should be a structured report: Issues Found / Looks Good / Suggested Changes. Follow the format from Claude Code agent definitions.\n\n${context}`,

    '.claude/skills/run-evals/SKILL.md': `You are a quality engineering expert. Generate a run-evals skill for .claude/skills/run-evals/SKILL.md. This skill loads test examples from golden/, runs each through the agent, collects results, compares to baseline, and reports pass rate. Format as SKILL.md with yaml frontmatter and clear step-by-step instructions. Keep it practical and focused.\n\n${context}`,

    '.claude/skills/session-handoff/SKILL.md': `You are a workflow automation expert. Generate a session-handoff skill for .claude/skills/session-handoff/SKILL.md. This skill updates MEMORY.md at session end with: what was completed (specific file paths & function names), what was started but unfinished, discoveries (constraints, dependencies), and what's next. Include guidance on keeping entries specific and removing entries older than 30 days. Format as SKILL.md with yaml frontmatter.\n\n${context}`,

    '/golden/README.md': `You are a testing infrastructure expert. Generate a golden/README.md file that explains how to build an eval dataset. Include: labeling format (JSON schema for eval examples), how to add new examples, categories of tests needed, guidance on harvesting production traces for failures. Make it concrete with 2-3 example eval structures. Be beginner-friendly but rigorous. Use markdown.\n\n${context}`,

    '.claude/agents/research-agent.md': `You are an expert at defining AI agents. Generate a research-agent.md agent definition for .claude/agents/. This agent should: explore codebases by reading/grepping, research questions, return self-contained summaries. It never writes files. Include YAML frontmatter with name, description, and system prompt. Follow Claude Code agent definition format.\n\n${context}`,

    '.claude/skills/context-audit/SKILL.md': `You are a workflow expert. Generate a context-audit skill for .claude/skills/context-audit/SKILL.md. This skill should: audit the current session context for rot, count tokens per section, identify irrelevant content, flag drifted tool descriptions, and recommend what to summarize/prune. Output a Context Health Report. Format as SKILL.md with yaml frontmatter.\n\n${context}`,

    '.claude/hooks/PreToolUse/block-dangerous-ops': `You are a security expert. Generate a bash script for .claude/hooks/PreToolUse/block-dangerous-ops that blocks dangerous operations. Block patterns like: rm -rf, DROP TABLE, DELETE FROM...WHERE 1, and production writes without confirmation. Provide actionable error messages. This is a bash script that receives TOOL_NAME and TOOL_INPUT as arguments.\n\n${context}`,

    '.claude/hooks/PostToolUse/code-review-auto': `You are a workflow automation expert. Generate a bash script for .claude/hooks/PostToolUse/code-review-auto that triggers the code-reviewer agent automatically after write operations. The script should receive tool output and invoke the code-reviewer agent with relevant context. Be specific about when to trigger.\n\n${context}`,
  };

  return prompts[fileName];
}

export function parseGeneratedContent(raw) {
  return raw.trim();
}

export function buildCLICommand(cli, prompt) {
  const commands = {
    claude:   ['claude', ['-p', prompt]],
    gemini:   ['gemini', ['-p', prompt]],
    codex:    ['codex', ['--quiet', prompt]],
    opencode: ['opencode', ['run', prompt]],
  };
  return commands[cli.binary] ?? ['claude', ['-p', prompt]];
}

function resumeCommand() {
  return `node ${process.argv[1]} --resume`;
}

export async function generateFiles({ cli, answers, stack, setupTier = 'standard', enhancedOptions = null }) {
  const contextFilename = getCLIFilename(cli);
  const already = await loadGeneratedFiles();
  const results = { ...already };

  // Determine which files to generate
  let filesToGenerate = STANDARD_FILES;
  if (setupTier === 'enhanced') {
    filesToGenerate = [...ENHANCED_FILES];

    // Add conditional files based on enhancedOptions
    if (enhancedOptions?.teamSize !== 'solo') {
      filesToGenerate.push('.claude/agents/research-agent.md');
      filesToGenerate.push('.claude/skills/context-audit/SKILL.md');
    }
    if (enhancedOptions?.criticality === 'critical') {
      filesToGenerate.push('.claude/hooks/PreToolUse/block-dangerous-ops');
    }
    if (enhancedOptions?.autoCodeReview) {
      filesToGenerate.push('.claude/hooks/PostToolUse/code-review-auto');
    }
  }

  for (const fileName of filesToGenerate) {
    if (already[fileName]) {
      process.stdout.write(chalk.dim(`  Skipping ${fileName} (already generated)\n`));
      continue;
    }

    process.stdout.write(chalk.dim(`  Generating ${fileName}...`));
    const prompt = buildPrompt(fileName, answers, stack, contextFilename);
    const [bin, args] = buildCLICommand(cli, prompt);

    try {
      const { stdout } = await execa(bin, args, { timeout: 300_000 });
      results[fileName] = parseGeneratedContent(stdout);
      await saveGeneratedFile(fileName, results[fileName]);
      process.stdout.write(chalk.green(' ✓\n'));
    } catch (err) {
      process.stdout.write(chalk.red(' ✗\n'));

      const haystack = `${err.stderr ?? ''} ${err.message ?? ''}`.toLowerCase();
      const isRateLimit = haystack.includes('rate limit') || haystack.includes('rate_limit');

      if (isRateLimit) {
        console.error(chalk.yellow(
          `\nRate limit hit generating ${fileName}.\n` +
          `Your progress is saved — run: ${chalk.bold(resumeCommand())}\n`
        ));
        process.exit(1);
      }

      if (err.timedOut) {
        console.error(chalk.red(`\nTimeout generating ${fileName}. The CLI did not respond within 5 minutes.`));
        console.error(chalk.yellow(`Run: ${chalk.bold(resumeCommand())} to retry from this file.\n`));
        process.exit(1);
      }

      console.error(chalk.red(`\nFailed to generate ${fileName}: ${err.message}`));
      process.exit(1);
    }
  }

  return results;
}
