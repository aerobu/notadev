import { execa } from 'execa';
import chalk from 'chalk';

export const SUPPORTED_FILES = ['PRD.md', 'ARCHITECTURE.md', 'DATA_MODEL.md', 'MILESTONES.md', 'CLAUDE.md'];

export function buildPrompt(fileName, answers, stack) {
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

    'CLAUDE.md': `You are a senior engineering lead. Generate a CLAUDE.md file that acts as a behavioral contract for an AI coding assistant working on this project. Include these exact rules:
1. Read PRD.md, ARCHITECTURE.md, DATA_MODEL.md, and MILESTONES.md before writing any code.
2. Always write tests before implementation (TDD). Never skip tests.
3. Do not begin a new milestone until the current milestone's definition of done is fully met. Ask the user to confirm before proceeding.
4. Do not deviate from the tech stack in ARCHITECTURE.md without asking the user first.
5. Do not invent new database tables or fields not in DATA_MODEL.md without asking first.
6. Keep all code changes small and focused. Commit after each milestone task.
Also include a project summary section so the assistant has context on startup.\n\n${context}`,
  };

  return prompts[fileName];
}

export function parseGeneratedContent(raw) {
  return raw.trim();
}

function buildCLICommand(cli, prompt) {
  const commands = {
    claude:   ['claude', ['-p', prompt]],
    gemini:   ['gemini', ['-p', prompt]],
    codex:    ['codex', ['--quiet', prompt]],
    opencode: ['opencode', ['run', prompt]],
  };
  return commands[cli.binary] ?? ['claude', ['-p', prompt]];
}

export async function generateFiles({ cli, answers, stack }) {
  const results = {};

  for (const fileName of SUPPORTED_FILES) {
    process.stdout.write(chalk.dim(`  Generating ${fileName}...`));
    const prompt = buildPrompt(fileName, answers, stack);
    const [bin, args] = buildCLICommand(cli, prompt);

    try {
      const { stdout } = await execa(bin, args, { timeout: 120_000 });
      results[fileName] = parseGeneratedContent(stdout);
      process.stdout.write(chalk.green(' ✓\n'));
    } catch (err) {
      process.stdout.write(chalk.red(' ✗\n'));

      if (err.exitCode === 1 && err.stderr?.includes('rate')) {
        console.error(chalk.yellow(
          `\nRate limit hit generating ${fileName}.\n` +
          `Your progress is saved — run: ${chalk.bold('npx notadev --resume')}\n`
        ));
        process.exit(1);
      }

      if (err.timedOut) {
        console.error(chalk.red(`\nTimeout generating ${fileName}. The CLI did not respond within 2 minutes.`));
        console.error(chalk.yellow(`Run: ${chalk.bold('npx notadev --resume')} to retry from this file.\n`));
        process.exit(1);
      }

      console.error(chalk.red(`\nFailed to generate ${fileName}: ${err.message}`));
      process.exit(1);
    }
  }

  return results;
}
