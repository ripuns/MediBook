import { analyseSymptoms, summariseVisit } from '../src/services/llm.service';

describe('LLM graceful fallback service', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    if (originalApiKey) {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  });

  it('returns a safe pre-visit fallback when the model key is missing', async () => {
    const result = await analyseSymptoms('Severe headache and dizziness');

    expect(result.fallback).toBe(true);
    expect(result.urgencyLevel).toBe('Low');
    expect(result.chiefComplaint).toBe('AI summary unavailable.');
    expect(Array.isArray(result.suggestedQuestions)).toBe(true);
    expect(result.suggestedQuestions.length).toBeGreaterThan(0);
  });

  it('returns a safe post-visit fallback when the model key is missing', async () => {
    const result = await summariseVisit('The patient reports ongoing fatigue and an upper respiratory issue after medication review.');

    expect(result.fallback).toBe(true);
    expect(result.summary).toContain('AI summary unavailable');
    expect(Array.isArray(result.medicationSchedule)).toBe(true);
    expect(Array.isArray(result.followUpSteps)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});
