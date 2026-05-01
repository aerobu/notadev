import inquirer from 'inquirer';
import chalk from 'chalk';

const REQUIRED_FIELDS = ['description', 'users', 'features', 'data', 'userFlow', 'integrations', 'milestones'];

const q = msg => chalk.cyan('\n' + msg);

export function buildQuestions() {
  return [
    {
      type: 'input',
      name: 'description',
      message: q('Describe your app in plain English — what problem does it solve?'),
      validate: v => v.trim().length > 10 || 'Please describe your app in at least a sentence.',
    },
    {
      type: 'input',
      name: 'users',
      message: q('Who are the people using it?'),
      validate: v => v.trim().length > 0 || 'Please describe your users.',
    },
    {
      type: 'input',
      name: 'features',
      message: q('What are the 3 most important things it needs to do? (separate with commas)'),
      validate: v => v.trim().length > 0 || 'Please list at least one feature.',
    },
    {
      type: 'input',
      name: 'data',
      message: q('What information does your app need to store or track?'),
      validate: v => v.trim().length > 0 || 'Please describe your data.',
    },
    {
      type: 'input',
      name: 'userFlow',
      message: q('Walk me through what a user does from the moment they open the app.'),
      validate: v => v.trim().length > 10 || 'Please describe the user journey.',
    },
    {
      type: 'input',
      name: 'integrations',
      message: q('Any integrations needed? (e.g. Stripe, Google login, email, Slack — or type "None")'),
      default: 'None',
    },
    {
      type: 'list',
      name: 'milestones',
      message: q('How many build stages do you want?\n  (Stages break your app into manageable chunks — e.g. Stage 1 sets up the basics,\n   Stage 2 adds core features, Stage 3 adds polish. Recommended: 3)'),
      choices: ['2', '3', '4'],
      default: '3',
    },
  ];
}

export function validateAnswers(answers) {
  return REQUIRED_FIELDS.every(field => answers[field] !== undefined && String(answers[field]).trim().length > 0);
}

export async function runInterview() {
  console.log(chalk.dim('  Let\'s build your project brief. Answer as you would explain to a friend.\n'));
  return inquirer.prompt(buildQuestions());
}

export function buildStackConfirmPrompt(stack) {
  return {
    type: 'confirm',
    name: 'stackApproved',
    message: chalk.cyan(`\nBased on your answers, I recommend this setup for your app:\n  ${chalk.bold(stack.label)}\n  What it uses: ${stack.frontend}, a reliable database (${stack.database}), deployed on ${stack.deployment}\n  Why: ${stack.rationale}\n  This is a well-supported, production-ready combination. Proceed with this setup?`),
    default: true,
  };
}

export async function confirmStack(stack) {
  const { stackApproved } = await inquirer.prompt([buildStackConfirmPrompt(stack)]);
  if (stackApproved) return stack;

  const { customStack } = await inquirer.prompt([{
    type: 'input',
    name: 'customStack',
    message: chalk.cyan('\nDescribe your preferred stack (e.g. "React + Node + MongoDB"):'),
  }]);
  return {
    label: customStack,
    frontend: null,
    database: null,
    orm: null,
    deployment: null,
    rationale: 'User-specified custom stack.',
    custom: true,
  };
}

export async function askSetupTier() {
  console.log('');
  console.log(chalk.cyan('  ╭─────────────────────────────────────────────────╮'));
  console.log(chalk.cyan('  │') + chalk.bold('  SETUP OPTIONS') + chalk.cyan('                                         │'));
  console.log(chalk.cyan('  ├─────────────────────────────────────────────────┤'));
  console.log(chalk.cyan('  │') + chalk.dim('  Standard (5 files, ~2 min)') + chalk.cyan('                          │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ PRD.md, ARCHITECTURE.md, DATA_MODEL.md,') + chalk.cyan('         │'));
  console.log(chalk.cyan('  │') + chalk.dim('    MILESTONES.md, CLAUDE.md') + chalk.cyan('                        │'));
  console.log(chalk.cyan('  │') + chalk.dim('  Get started fast, everything you need to begin') + chalk.cyan('       │'));
  console.log(chalk.cyan('  │') + chalk.cyan('                                                 │'));
  console.log(chalk.cyan('  │') + chalk.bold.cyan('  Enhanced (13 files, ~10 min)') + chalk.cyan('                      │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ Everything above, PLUS:') + chalk.cyan('                         │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ MEMORY.md — session continuity') + chalk.cyan('                   │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ .claude/rules/ — code standards & security') + chalk.cyan('       │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ .claude/agents/ — code review automation') + chalk.cyan('         │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ .claude/skills/ — evals & session tracking') + chalk.cyan('       │'));
  console.log(chalk.cyan('  │') + chalk.dim('  ✓ /golden/ — eval dataset framework') + chalk.cyan('              │'));
  console.log(chalk.cyan('  │') + chalk.dim('  Build with production discipline from day one') + chalk.cyan('       │'));
  console.log(chalk.cyan('  ╰─────────────────────────────────────────────────╯'));
  console.log('');

  const { setupTier } = await inquirer.prompt([{
    type: 'list',
    name: 'setupTier',
    message: chalk.cyan('Which setup do you want?'),
    choices: [
      {
        name: 'Standard — Quick start (2 min)',
        value: 'standard',
      },
      {
        name: 'Enhanced — Production-ready (10 min)',
        value: 'enhanced',
      },
    ],
    default: 'standard',
  }]);

  return setupTier;
}

export async function askEnhancedOptions() {
  console.log('');
  return inquirer.prompt([
    {
      type: 'list',
      name: 'teamSize',
      message: chalk.cyan('What\'s your team size?'),
      choices: [
        { name: 'Just me (solo)', value: 'solo' },
        { name: 'Small team (2-5 people)', value: 'small' },
        { name: 'Medium team (6-20+ people)', value: 'medium' },
      ],
      default: 'solo',
    },
    {
      type: 'list',
      name: 'criticality',
      message: chalk.cyan('This project will be:'),
      choices: [
        { name: 'Internal experiment', value: 'internal' },
        { name: 'Customer-facing', value: 'customer' },
        { name: 'Mission-critical / regulated', value: 'critical' },
      ],
      default: 'internal',
    },
    {
      type: 'confirm',
      name: 'autoCodeReview',
      message: chalk.cyan('Auto-run code review after I write code?'),
      default: true,
    },
  ]);
}
