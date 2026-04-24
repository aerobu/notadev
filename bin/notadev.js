#!/usr/bin/env node
import { detectCLI } from '../src/detect.js';
import { runInterview, confirmStack } from '../src/interview.js';
import { recommendStack } from '../src/recommend.js';
import { generateFiles } from '../src/generate.js';
import { writeFiles } from '../src/writer.js';
import { loadSession, saveSession, clearSession } from '../src/session.js';
import chalk from 'chalk';

const isResume = process.argv.includes('--resume');

// Banner
console.log('');
console.log(chalk.cyan('  ╭────────────────────────────────────────────────╮'));
console.log(chalk.cyan('  │') + chalk.bold.white('  📋  notadev') + chalk.dim('  v0.1.0') + chalk.cyan('                            │'));
console.log(chalk.cyan('  │') + chalk.dim('  AI project brief generator                    ') + chalk.cyan('│'));
console.log(chalk.cyan('  ╰────────────────────────────────────────────────╯'));
console.log('');
console.log(chalk.white('  Answer a few plain-English questions and notadev will'));
console.log(chalk.white('  generate 5 structured project files your AI coding CLI'));
console.log(chalk.white('  (Claude Code, Gemini, Codex, OpenCode) needs to build'));
console.log(chalk.white('  a well-architected app from session one.'));
console.log('');
console.log(chalk.dim('  ────────────────────────────────────────────────────'));
console.log(chalk.yellow('  ⚠  Review all generated files before use — AI output'));
console.log(chalk.yellow('     may need adjustments to match your exact needs.'));
console.log(chalk.yellow('  ⚠  This tool uses your existing AI CLI account to'));
console.log(chalk.yellow('     generate files. Your login and tokens will be used.'));
console.log(chalk.yellow('  ⚠  Generating 5 files typically uses a moderate number'));
console.log(chalk.yellow('     of tokens — check your plan limits if needed.'));
console.log(chalk.dim('  ────────────────────────────────────────────────────'));
console.log('');

let session = isResume ? await loadSession() : null;

if (isResume && !session) {
  console.log(chalk.yellow('  No saved session found. Starting fresh.\n'));
}

const cli = session?.cli ?? await detectCLI();
const answers = session?.answers ?? await runInterview();
const stack = session?.stack ?? await confirmStack(recommendStack(answers));

await saveSession({ cli, answers, stack, generatedFiles: session?.generatedFiles });

const files = await generateFiles({ cli, answers, stack });
await writeFiles(files, cli);
await clearSession();

console.log('');
console.log(chalk.bold("  You're ready. Open your CLI in this folder and start with:"));
console.log(chalk.cyan('  "Read all .md files in this directory, then let\'s begin Milestone 1."'));
console.log('');
