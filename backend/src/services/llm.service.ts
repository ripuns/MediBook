import { GoogleGenAI } from '@google/genai';

export type PreVisitAssessment = {
  fallback?: boolean;
  urgencyLevel: 'Low' | 'Medium' | 'High';
  chiefComplaint: string;
  suggestedQuestions: string[];
};

export type VisitSummary = {
  fallback?: boolean;
  summary: string;
  medicationSchedule: Array<{
    drug: string;
    dose: string;
    frequency: string;
    duration: string;
  }>;
  followUpSteps: string[];
  warnings: string[];
};

const PRE_VISIT_PROMPT = `Analyse these symptoms and return ONLY valid JSON with exactly these keys:
{
  "urgencyLevel": "Low" | "Medium" | "High",
  "chiefComplaint": "string (max 100 chars)",
  "suggestedQuestions": ["question1", "question2", "question3"]
}
Do not include any text, explanation, or markdown outside the JSON object.
Symptoms: <symptoms>`;

const POST_VISIT_PROMPT = `Convert these clinical notes into a patient-friendly summary.
Return ONLY valid JSON with exactly these keys:
{
  "summary": "plain language explanation of findings (2-3 sentences)",
  "medicationSchedule": [{ "drug": "string", "dose": "string", "frequency": "string", "duration": "string" }],
  "followUpSteps": ["step1", "step2"],
  "warnings": ["any warnings, empty array if none"]
}
Clinical notes: <notes>`;

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const geminiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export function buildPreVisitFallback(): PreVisitAssessment {
  return {
    fallback: true,
    urgencyLevel: 'Low',
    chiefComplaint: 'AI summary unavailable.',
    suggestedQuestions: [
      'Please follow the clinician’s advice for next steps.',
      'Tell the clinic if symptoms worsen or new symptoms appear.',
      'Bring a list of medications and concerns to your next visit.',
    ],
  };
}

export function buildPostVisitFallback(): VisitSummary {
  return {
    fallback: true,
    summary: 'AI summary unavailable. Please review your clinical notes with your clinician for the latest guidance.',
    medicationSchedule: [],
    followUpSteps: ['Review the diagnosis and care plan with your clinician.', 'Follow the prescribed treatment instructions exactly.'],
    warnings: [],
  };
}

function normalisePreVisitPayload(payload: unknown): PreVisitAssessment {
  if (!payload || typeof payload !== 'object') {
    return buildPreVisitFallback();
  }

  const candidate = payload as Partial<PreVisitAssessment> & {
    urgencyLevel?: unknown;
    chiefComplaint?: unknown;
    suggestedQuestions?: unknown;
  };

  const urgencyLevel = candidate.urgencyLevel;
  const validUrgency = urgencyLevel === 'Low' || urgencyLevel === 'Medium' || urgencyLevel === 'High' ? urgencyLevel : 'Low';

  const chiefComplaint = typeof candidate.chiefComplaint === 'string' && candidate.chiefComplaint.trim().length > 0
    ? candidate.chiefComplaint.trim().slice(0, 100)
    : 'AI summary unavailable.';

  const suggestedQuestions = Array.isArray(candidate.suggestedQuestions)
    ? candidate.suggestedQuestions
        .filter((question): question is string => typeof question === 'string')
        .map((question) => question.trim())
        .filter((question) => question.length > 0)
        .slice(0, 3)
    : [];

  return {
    fallback: false,
    urgencyLevel: validUrgency,
    chiefComplaint,
    suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : ['Please follow the clinician’s guidance.', 'Share any worsening symptoms promptly.', 'Bring a list of concerns to your next visit.'],
  };
}

function normalisePostVisitPayload(payload: unknown): VisitSummary {
  if (!payload || typeof payload !== 'object') {
    return buildPostVisitFallback();
  }

  const candidate = payload as Partial<VisitSummary> & {
    summary?: unknown;
    medicationSchedule?: unknown;
    followUpSteps?: unknown;
    warnings?: unknown;
  };

  const summary = typeof candidate.summary === 'string' && candidate.summary.trim().length > 0
    ? candidate.summary.trim()
    : 'AI summary unavailable. Please review the clinical notes with your clinician.';

  const medicationEntries = Array.isArray(candidate.medicationSchedule) ? candidate.medicationSchedule : [];
  const medicationSchedule = medicationEntries.map((entry) => {
    const item = entry as Record<string, unknown>;
    return {
      drug: typeof item.drug === 'string' ? item.drug : 'Medication',
      dose: typeof item.dose === 'string' ? item.dose : 'As directed',
      frequency: typeof item.frequency === 'string' ? item.frequency : 'Daily',
      duration: typeof item.duration === 'string' ? item.duration : 'As advised',
    };
  });

  const followUpSteps = Array.isArray(candidate.followUpSteps)
    ? candidate.followUpSteps.filter((step): step is string => typeof step === 'string' && step.trim().length > 0).map((step) => step.trim())
    : [];

  const warnings = Array.isArray(candidate.warnings)
    ? candidate.warnings.filter((warning): warning is string => typeof warning === 'string' && warning.trim().length > 0).map((warning) => warning.trim())
    : [];

  return {
    fallback: false,
    summary,
    medicationSchedule,
    followUpSteps: followUpSteps.length > 0 ? followUpSteps : ['Review the diagnosis and care plan with your clinician.', 'Follow the prescribed treatment instructions exactly.'],
    warnings,
  };
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (codeFenceMatch && codeFenceMatch[1]) {
    return codeFenceMatch[1].trim();
  }

  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');

  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function parseJsonResponse(rawText: string): unknown {
  try {
    return JSON.parse(stripCodeFence(rawText));
  } catch {
    return null;
  }
}

async function callGemini(prompt: string): Promise<string> {
  if (!geminiClient) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const response = await geminiClient.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0,
    },
  });

  const content = response.text;

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Gemini returned an empty response.');
  }

  return content;
}

export async function analyseSymptoms(symptoms: string): Promise<PreVisitAssessment> {
  try {
    const prompt = PRE_VISIT_PROMPT.replace('<symptoms>', symptoms ?? '');
    const rawText = await callGemini(prompt);
    const payload = parseJsonResponse(rawText);

    return payload ? normalisePreVisitPayload(payload) : buildPreVisitFallback();
  } catch {
    return buildPreVisitFallback();
  }
}

export async function summariseVisit(notes: string): Promise<VisitSummary> {
  try {
    const prompt = POST_VISIT_PROMPT.replace('<notes>', notes ?? '');
    const rawText = await callGemini(prompt);
    const payload = parseJsonResponse(rawText);

    return payload ? normalisePostVisitPayload(payload) : buildPostVisitFallback();
  } catch {
    return buildPostVisitFallback();
  }
}
