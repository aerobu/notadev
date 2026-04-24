import dashboard from '../templates/stacks/dashboard.js';
import saas from '../templates/stacks/saas.js';
import api from '../templates/stacks/api.js';
import internalTool from '../templates/stacks/internal-tool.js';

const STACK_MAP = { dashboard, saas, api, 'internal-tool': internalTool };

// Classification priority (first match wins): dashboard > saas > api > internal-tool (default)
const KEYWORDS = {
  dashboard: ['dashboard', 'chart', 'graph', 'analytics', 'metric', 'report', 'csv', 'visualization'],
  saas:      ['subscription', 'billing', 'payment', 'stripe', 'saas', 'monthly', 'plan', 'tier'],
  api:       ['api', 'rest', 'endpoint', 'backend', 'mobile app', 'microservice', 'webhook'],
};

function matchesKeyword(text, kw) {
  const pattern = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`);
  return pattern.test(text);
}

export function classifyAppType(answers) {
  const text = `${answers.description} ${answers.features} ${answers.integrations ?? ''}`.toLowerCase();

  for (const [type, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(kw => matchesKeyword(text, kw))) return type;
  }

  return 'internal-tool';
}

export function recommendStack(answers) {
  const type = classifyAppType(answers);
  return { ...STACK_MAP[type] };
}
