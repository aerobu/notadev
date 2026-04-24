import { writeFileSync } from 'fs';
import { join } from 'path';
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

export async function writeFiles(files, cli) {
  const contextFilename = getCLIFilename(cli);

  for (const [name, content] of Object.entries(files)) {
    const outputName = name === 'CLAUDE.md' ? contextFilename : name;
    const outputPath = join(process.cwd(), outputName);
    try {
      writeFileSync(outputPath, content, 'utf8');
      console.log(chalk.green(`✓ ${outputName} created`));
    } catch (err) {
      console.error(chalk.red(`✗ Failed to write ${outputName}: ${err.message}`));
      throw err;
    }
  }
}
