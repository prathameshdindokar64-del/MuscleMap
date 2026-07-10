/**
 * geminiAnalyzer.ts
 * Replaces the rule-based painAnalyzer with Google Gemini AI.
 * Uses Gemini 1.5 Flash (free tier) for analysis.
 * Falls back to rule-based analysis if Gemini is unavailable.
 *
 * EXTENSIBILITY: Swap GEMINI_API_KEY with any other AI provider by
 * changing only this file. The input/output contract stays identical.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config';
import { calculateRisk } from './riskCalculator';
import { REGION_MUSCLES } from '../constants/regions';
import { WARNING_TEXT, DISCLAIMER_TEXT } from '../constants/messages';
import { ACUPRESSURE_POINTS } from '../constants/acupressure';
import type { AnalyzeInput, AnalyzeOutput, RiskLevel } from '../types';
import Database from 'better-sqlite3';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Builds the prompt sent to Gemini for analysis.
 * Structured to return predictable JSON output.
 */
function buildPrompt(input: AnalyzeInput, regionName: string, muscles: string[]): string {
  return `
You are a physiotherapy and sports medicine assistant. A user is reporting muscle pain and needs educational self-care guidance. You must respond with ONLY a valid JSON object — no markdown, no explanation, no preamble.

USER PAIN PROFILE:
- Body region: ${regionName}
- Muscles involved: ${muscles.join(', ')}
- Pain type: ${input.painType}
- Duration: ${input.duration.replace(/_/g, ' ')}
- Intensity: ${input.intensity}/10
- Stress level: ${input.stressLevel || 'not specified'}
- Trigger: ${input.trigger || 'not specified'}

Respond with this exact JSON structure:
{
  "exercises": [
    {
      "title": "Exercise name",
      "instructions": "Clear 3-4 sentence instructions written for a non-medical person. Be specific about reps, sets, and duration.",
      "tags": ["tag1", "tag2"]
    }
  ],
  "aiInsight": "2-3 sentence personalized insight about this specific pain profile. Be empathetic but informative. Mention the likely cause based on the trigger and duration.",
  "recoveryTips": ["Tip 1 for this specific pain", "Tip 2", "Tip 3"]
}

Rules:
- Provide exactly 3 exercises tailored to the pain type "${input.painType}" and region "${regionName}"
- Exercises must be safe for home use with no equipment (except optional items like a foam roller or tennis ball)
- If intensity >= 7 or pain type is "numbness", include at least one gentle rest-based exercise
- Tags should be from: Stretch, Strengthening, Self-massage, Trigger point, Breathing, Mobility, Beginner, Intermediate
- aiInsight must mention the specific region and pain type
- recoveryTips must be practical and specific to this pain profile
- NEVER mention medications, diagnoses, or claim to replace a doctor
- Response must be valid JSON only — absolutely no text outside the JSON object
`;
}

/**
 * Analyzes pain input using Google Gemini AI.
 * Falls back to rule-based analysis if AI call fails.
 */
export async function analyzeWithGemini(
  input: AnalyzeInput,
  regionName: string,
  db: Database.Database
): Promise<AnalyzeOutput> {
  const muscles = REGION_MUSCLES[input.region] ?? ['Consult a professional for assessment'];
  const riskLevel = calculateRisk(input);
  const warningText = WARNING_TEXT[riskLevel];
  const acupressurePoints = ACUPRESSURE_POINTS[input.region] ?? [];

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildPrompt(input, regionName, muscles);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Strip any accidental markdown code fences
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      regionName,
      muscles,
      exercises: parsed.exercises || [],
      aiInsight: parsed.aiInsight || '',
      recoveryTips: parsed.recoveryTips || [],
      riskLevel,
      warningText,
      disclaimerText: DISCLAIMER_TEXT,
      acupressurePoints,
      generatedBy: 'gemini-1.5-flash',
    };
  } catch (error) {
    // Fallback to database exercises if Gemini fails
    console.error('Gemini analysis failed, falling back to rule-based:', error);
    return fallbackAnalysis(input, regionName, muscles, riskLevel, acupressurePoints, db);
  }
}

/**
 * Rule-based fallback when Gemini is unavailable.
 * Queries the exercises table in SQLite.
 */
function fallbackAnalysis(
  input: AnalyzeInput,
  regionName: string,
  muscles: string[],
  riskLevel: RiskLevel,
  acupressurePoints: any[],
  db: Database.Database
): AnalyzeOutput {
  // Query exercises from database for this region
  const exercises = db.prepare(`
    SELECT title, instructions, tags FROM exercises
    WHERE region_id = ?
    ORDER BY RANDOM()
    LIMIT 3
  `).all(input.region).map((e: any) => ({
    ...e,
    tags: JSON.parse(e.tags || '[]'),
  }));

  return {
    regionName,
    muscles,
    exercises,
    aiInsight: `Based on your ${input.painType} pain in the ${regionName} region lasting ${input.duration.replace(/_/g, ' ')}, we recommend the following self-care exercises.`,
    recoveryTips: [
      'Apply ice for 15 minutes if the area feels inflamed',
      'Avoid movements that worsen the pain',
      'Rest the affected area between exercise sessions',
    ],
    riskLevel,
    warningText: WARNING_TEXT[riskLevel as RiskLevel],
    disclaimerText: DISCLAIMER_TEXT,
    acupressurePoints,
    generatedBy: 'rule-based-fallback',
  };
}
