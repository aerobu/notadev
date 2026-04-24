import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';

export const CLI_CONFIGS = [
  { name: 'Claude Code', binary: 'claude',    testFlag: '--version' },
  { name: 'Gemini CLI',  binary: 'gemini',    testFlag: '--version' },
  { name: 'Codex',       binary: 'codex',     testFlag: '--version' },
  { name: 'OpenCode',    binary: 'opencode',  testFlag: '--version' },
];

export function findInstalledCLIs() {
  return CLI_CONFIGS.filter(({ binary, testFlag }) => {
    try {
      execSync(`${binary} ${testFlag}`, {
        stdio: 'ignore',
        timeout: 3000,
        env: {
          ...process.env,
          PATH: `${process.env.HOME}/.local/bin:${process.env.HOME}/.nvm/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  });
}

export async function detectCLI(finder = findInstalledCLIs) {
  const installed = await finder();

  if (installed.length === 0) {
    console.error(chalk.red(
      '\nNo supported CLI found. Please install one of: Claude Code, Gemini CLI, Codex, or OpenCode.\n' +
      'Then re-run: npx notadev\n'
    ));
    process.exit(1);
  }

  if (installed.length === 1) {
    console.log(chalk.green(`Found ${installed[0].name}. Using it to generate your files.\n`));
    return installed[0];
  }

  const { chosen } = await inquirer.prompt([{
    type: 'list',
    name: 'chosen',
    message: 'Which CLI would you like to use?',
    choices: installed.map(c => ({ name: c.name, value: c })),
  }]);

  return chosen;
}
