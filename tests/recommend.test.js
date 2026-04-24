import { describe, it, expect } from 'vitest';
import { classifyAppType, recommendStack } from '../src/recommend.js';

describe('classifyAppType', () => {
  it('classifies dashboard apps', () => {
    const answers = {
      description: 'A dashboard to track sales metrics and display charts from CSV data',
      features: 'charts, filters, CSV import',
    };
    expect(classifyAppType(answers)).toBe('dashboard');
  });

  it('classifies SaaS apps', () => {
    const answers = {
      description: 'A subscription platform where users pay monthly for access',
      features: 'subscriptions, billing, user accounts',
    };
    expect(classifyAppType(answers)).toBe('saas');
  });

  it('classifies API/backend services', () => {
    const answers = {
      description: 'A REST API for mobile app to consume',
      features: 'endpoints, authentication, data storage',
    };
    expect(classifyAppType(answers)).toBe('api');
  });

  it('defaults to internal-tool for unmatched descriptions', () => {
    const answers = {
      description: 'A tool for my team to manage requests',
      features: 'form submission, tracking, email notifications',
    };
    expect(classifyAppType(answers)).toBe('internal-tool');
  });
});

describe('recommendStack', () => {
  it('returns a stack object with required fields', () => {
    const answers = {
      description: 'A dashboard for tracking orders',
      features: 'charts, filters',
    };
    const stack = recommendStack(answers);
    expect(stack).toHaveProperty('label');
    expect(stack).toHaveProperty('frontend');
    expect(stack).toHaveProperty('database');
    expect(stack).toHaveProperty('deployment');
    expect(stack).toHaveProperty('rationale');
  });
});
