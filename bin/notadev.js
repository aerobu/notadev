#!/usr/bin/env node
import { detectCLI } from '../src/detect.js';
import { runInterview, confirmStack, askSetupTier, askEnhancedOptions } from '../src/interview.js';
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
console.log(chalk.white('  generate your project brief. Choose Standard (5 files in 2 min)'));
console.log(chalk.white('  or Enhanced (13 files with evals & security in 10 min).'));
console.log(chalk.white('  Works with Claude Code, Gemini, Codex, OpenCode.'));
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
const setupTier = session?.setupTier ?? await askSetupTier();
const enhancedOptions = setupTier === 'enhanced' && !session?.enhancedOptions ? await askEnhancedOptions() : session?.enhancedOptions || null;

await saveSession({ cli, answers, stack, setupTier, enhancedOptions, generatedFiles: session?.generatedFiles });

const files = await generateFiles({ cli, answers, stack, setupTier, enhancedOptions });
await writeFiles(files, cli, setupTier);

// Create /golden/baseline.json for enhanced setup
if (setupTier === 'enhanced') {
  const fs = await import('fs');
  const path = await import('path');
  const baselineFile = path.join(process.cwd(), 'golden', 'baseline.json');
  const baseline = {
    version: '1.0',
    created: new Date().toISOString(),
    categories: {},
    totalPassRate: null,
    notes: 'Update this file after running your first eval suite. See golden/README.md for guidance.'
  };
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2), 'utf8');
  console.log(chalk.green('✓ golden/baseline.json created'));
}

await clearSession();

console.log('');
console.log(chalk.bold("  You're ready. Open your CLI in this folder and start with:"));
console.log(chalk.cyan('  "Read all .md files in this directory, then let\'s begin Milestone 1."'));
console.log('');
