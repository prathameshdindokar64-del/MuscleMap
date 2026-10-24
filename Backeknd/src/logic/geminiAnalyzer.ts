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
import { calculateRisk, RiskResult } from './riskCalculator';
import { selectExercises } from './exerciseSelector';
import { REGION_MUSCLES } from '../constants/regions';
import { WARNING_TEXT, DISCLAIMER_TEXT } from '../constants/messages';
import { ACUPRESSURE_POINTS } from '../constants/acupressure';
import type { AnalyzeInput, AnalyzeOutput, AcupressureResponse, ExerciseResponse } from '../types';
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
 * Helper to fetch acupressure points from DB or fallback constants.
 */
function getAcupressurePoints(regionId: string, db: Database.Database): AcupressureResponse[] {
  try {
    const rows = db.prepare(
      'SELECT name, location, how_to FROM acupressure_points WHERE region_id = ?'
    ).all(regionId) as { name: string; location: string; how_to: string }[];
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        name: r.name,
        location: r.location,
        howTo: r.how_to,
      }));
    }
  } catch {
    // fallback if table is not yet created
  }

  return (ACUPRESSURE_POINTS[regionId] ?? []).map((p) => ({
    name: p.name,
    location: p.description,
    howTo: p.technique,
  }));
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
  const riskResult = calculateRisk(input);
  const warningText = WARNING_TEXT[riskResult.riskLevel];
  const acupressurePoints = getAcupressurePoints(input.region, db);

  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('AIzaSyDzyqciU0BZxWIknHHa8hGXv7y4k9pOjAs') || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return fallbackAnalysis(input, regionName, muscles, riskResult, acupressurePoints, db);
  }

  try {
    let resultText = '';
    const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = buildPrompt(input, regionName, muscles);
        const result = await model.generateContent(prompt);
        resultText = result.response.text().trim();
        if (resultText) break;
      } catch (err: any) {
        lastError = err;
        if (err?.message?.includes('leaked') || err?.message?.includes('PERMISSION_DENIED')) {
          // Key revoked by provider, no point trying other models with same key
          break;
        }
      }
    }

    if (!resultText) {
      throw lastError || new Error('No response from Gemini models');
    }

    // Strip any accidental markdown code fences
    const cleanJson = resultText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const exercises: ExerciseResponse[] = (parsed.exercises || []).map((ex: any, idx: number) => ({
      id: `gemini-${idx}-${Date.now()}`,
      title: ex.title || 'Exercise',
      instructions: ex.instructions || '',
      tags: Array.isArray(ex.tags) ? ex.tags : ['Stretch'],
      videoSearchQuery: `${ex.title || 'Exercise'} how to physiotherapy beginner`,
      guidedModeAvailable: true,
    }));

    return {
      sessionId: '',
      createdAt: new Date().toISOString(),
      regionName,
      muscles,
      exercises,
      aiInsight: parsed.aiInsight || '',
      recoveryTips: parsed.recoveryTips || [],
      riskLevel: riskResult.riskLevel,
      redFlagReasons: riskResult.redFlagReasons,
      riskSource: 'rules',
      mlConfidence: 0,
      warningText,
      disclaimerText: DISCLAIMER_TEXT,
      acupressurePoints,
      generatedBy: 'Gemini AI',
    };
  } catch (error: any) {
    if (error?.message?.includes('leaked') || error?.message?.includes('PERMISSION_DENIED')) {
      console.warn('[Gemini AI] The GEMINI_API_KEY in Backeknd/.env was revoked by Google ("reported as leaked"). Seamlessly operating with Clinical Knowledgebase rules.');
    } else {
      console.warn('[Gemini AI] Offline or unavailable, operating with Clinical Knowledgebase rules:', error?.message || error);
    }
    return fallbackAnalysis(input, regionName, muscles, riskResult, acupressurePoints, db);
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
  riskResult: RiskResult,
  acupressurePoints: AcupressureResponse[],
  db: Database.Database
): AnalyzeOutput {
  const exercises = selectExercises(input.region, input.painType, db);

  return {
    sessionId: '',
    createdAt: new Date().toISOString(),
    regionName,
    muscles,
    exercises,
    aiInsight: `Based on your ${input.painType} pain in the ${regionName} region lasting ${input.duration.replace(/_/g, ' ')}, we recommend the following self-care exercises.`,
    recoveryTips: [
      'Apply ice for 15 minutes if the area feels inflamed',
      'Avoid movements that worsen the pain',
      'Rest the affected area between exercise sessions',
    ],
    riskLevel: riskResult.riskLevel,
    redFlagReasons: riskResult.redFlagReasons,
    riskSource: 'rules',
    mlConfidence: 0,
    warningText: WARNING_TEXT[riskResult.riskLevel],
    disclaimerText: DISCLAIMER_TEXT,
    acupressurePoints,
    generatedBy: 'Clinical Knowledgebase',
  };
}
