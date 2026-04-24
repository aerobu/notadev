#!/usr/bin/env node
import { detectCLI } from '../src/detect.js';
import { runInterview, confirmStack } from '../src/interview.js';
import { recommendStack } from '../src/recommend.js';
import { generateFiles } from '../src/generate.js';
import { writeFiles } from '../src/writer.js';
import { loadSession, saveSession, clearSession } from '../src/session.js';
import chalk from 'chalk';

const isResume = process.argv.includes('--resume');

console.log(chalk.bold('\nWelcome to notadev — let\'s build your project brief.\n'));

let session = isResume ? await loadSession() : null;

if (isResume && !session) {
  console.log(chalk.yellow('No saved session found. Starting fresh.\n'));
}

const cli = session?.cli ?? await detectCLI();
const answers = session?.answers ?? await runInterview();
const recommended = recommendStack(answers);
const stack = session?.stack ?? await confirmStack(recommended);

await saveSession({ cli, answers, stack });

const files = await generateFiles({ cli, answers, stack });
await writeFiles(files, cli);
await clearSession();

console.log(chalk.bold('\nYou\'re ready. Open your CLI in this folder and start with:'));
console.log(chalk.cyan('  "Read all .md files in this directory, then let\'s begin Milestone 1."\n'));
