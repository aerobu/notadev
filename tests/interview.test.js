import { describe, it, expect } from 'vitest';
import { buildQuestions, validateAnswers } from '../src/interview.js';

describe('buildQuestions', () => {
  it('returns an array of Inquirer question objects', () => {
    const questions = buildQuestions();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThanOrEqual(7);
  });

  it('every question has name, message, and type', () => {
    for (const q of buildQuestions()) {
      expect(q).toHaveProperty('name');
      expect(q).toHaveProperty('message');
      expect(q).toHaveProperty('type');
    }
  });
});

describe('validateAnswers', () => {
  const validAnswers = {
    description: 'A dashboard for tracking procurement orders',
    users: 'Procurement managers',
    features: 'Order tracking, supplier management, reporting',
    data: 'Orders, suppliers, line items',
    userFlow: 'Login, view dashboard, create order, track status',
    integrations: 'None',
    milestones: '3',
  };

  it('returns true for valid answers', () => {
    expect(validateAnswers(validAnswers)).toBe(true);
  });

  it('returns false when required field is missing', () => {
    const { description, ...rest } = validAnswers;
    expect(validateAnswers(rest)).toBe(false);
  });

  it('returns false when required field is empty string', () => {
    expect(validateAnswers({ ...validAnswers, description: '' })).toBe(false);
  });
});
