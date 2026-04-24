import inquirer from 'inquirer';

const REQUIRED_FIELDS = ['description', 'users', 'features', 'data', 'userFlow', 'integrations', 'milestones'];

export function buildQuestions() {
  return [
    {
      type: 'input',
      name: 'description',
      message: 'Describe your app in plain English — what problem does it solve?',
      validate: v => v.trim().length > 10 || 'Please describe your app in at least a sentence.',
    },
    {
      type: 'input',
      name: 'users',
      message: 'Who are the people using it?',
      validate: v => v.trim().length > 0 || 'Please describe your users.',
    },
    {
      type: 'input',
      name: 'features',
      message: 'What are the 3 most important things it needs to do? (separate with commas)',
      validate: v => v.trim().length > 0 || 'Please list at least one feature.',
    },
    {
      type: 'input',
      name: 'data',
      message: 'What information does your app need to store or track?',
      validate: v => v.trim().length > 0 || 'Please describe your data.',
    },
    {
      type: 'input',
      name: 'userFlow',
      message: 'Walk me through what a user does from the moment they open the app.',
      validate: v => v.trim().length > 10 || 'Please describe the user journey.',
    },
    {
      type: 'input',
      name: 'integrations',
      message: 'Any integrations needed? (e.g. Stripe, Google login, email, Slack — or type "None")',
      default: 'None',
    },
    {
      type: 'list',
      name: 'milestones',
      message: 'How many development milestones do you want?',
      choices: ['2', '3', '4'],
      default: '3',
    },
  ];
}

export function validateAnswers(answers) {
  return REQUIRED_FIELDS.every(field => answers[field] !== undefined && String(answers[field]).trim().length > 0);
}

export async function runInterview() {
  console.log('\nLet\'s start with the basics. Answer as you would explain to a friend.\n');
  return inquirer.prompt(buildQuestions());
}

export function buildStackConfirmPrompt(stack) {
  return {
    type: 'confirm',
    name: 'stackApproved',
    message: `Based on your answers, I suggest: ${stack.label}\n  → ${stack.frontend} + ${stack.database} + ${stack.orm}, deployed on ${stack.deployment}\n  Reason: ${stack.rationale}\n  Does this work for you?`,
    default: true,
  };
}

export async function confirmStack(stack) {
  const { stackApproved } = await inquirer.prompt([buildStackConfirmPrompt(stack)]);
  if (stackApproved) return stack;

  const { customStack } = await inquirer.prompt([{
    type: 'input',
    name: 'customStack',
    message: 'Describe your preferred stack (e.g. "React + Node + MongoDB"):',
  }]);
  return { ...stack, label: customStack, custom: true };
}
