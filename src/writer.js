import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';

const CLI_FILENAMES = {
  claude:   'CLAUDE.md',
  gemini:   'GEMINI.md',
  codex:    'AGENTS.md',
  opencode: 'AGENTS.md',
};

export function getCLIFilename(cli) {
  return CLI_FILENAMES[cli.binary] ?? 'CLAUDE.md';
}

export async function writeFiles(files, cli, setupTier = 'standard') {
  const contextFilename = getCLIFilename(cli);
  const baseDir = process.cwd();

  // Create necessary directories for enhanced setup
  if (setupTier === 'enhanced') {
    try {
      mkdirSync(join(baseDir, '.claude/rules'), { recursive: true });
      mkdirSync(join(baseDir, '.claude/agents'), { recursive: true });
      mkdirSync(join(baseDir, '.claude/skills/run-evals'), { recursive: true });
      mkdirSync(join(baseDir, '.claude/skills/session-handoff'), { recursive: true });
      mkdirSync(join(baseDir, '.claude/skills/context-audit'), { recursive: true });
      mkdirSync(join(baseDir, '.claude/hooks/PreToolUse'), { recursive: true });
      mkdirSync(join(baseDir, '.claude/hooks/PostToolUse'), { recursive: true });
      mkdirSync(join(baseDir, 'golden'), { recursive: true });
    } catch (err) {
      console.error(chalk.red(`✗ Failed to create directories: ${err.message}`));
      throw err;
    }
  }

  for (const [name, content] of Object.entries(files)) {
    let outputPath;
    let outputDisplay;

    if (name === 'CLAUDE.md') {
      outputPath = join(baseDir, contextFilename);
      outputDisplay = contextFilename;
    } else if (name === 'GEMINI.md') {
      outputPath = join(baseDir, 'GEMINI.md');
      outputDisplay = 'GEMINI.md';
    } else if (name === 'AGENTS.md') {
      outputPath = join(baseDir, 'AGENTS.md');
      outputDisplay = 'AGENTS.md';
    } else {
      // Enhanced files with paths like '.claude/rules/CONVENTIONS.md'
      outputPath = join(baseDir, name);
      outputDisplay = name;
    }

    try {
      // Ensure parent directory exists
      const parentDir = dirname(outputPath);
      mkdirSync(parentDir, { recursive: true });

      writeFileSync(outputPath, content, 'utf8');
      console.log(chalk.green(`✓ ${outputDisplay} created`));
    } catch (err) {
      console.error(chalk.red(`✗ Failed to write ${outputDisplay}: ${err.message}`));
      throw err;
    }
  }
}
