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
