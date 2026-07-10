/**
 * Shared TypeScript interfaces for the MuscleMap backend.
 * All types used across the application are defined here to ensure consistency.
 * EXTENSIBILITY: Add new interfaces as features are added (e.g., User, AuthToken, AIResult).
 */

// ─── Risk Level ──────────────────────────────────────────────────────
export type RiskLevel = 'mild' | 'moderate' | 'severe' | 'red_flag';

// ─── Pain Type ───────────────────────────────────────────────────────
export type PainType = 'dull' | 'sharp' | 'stiffness' | 'burning' | 'numbness';

// ─── Duration ────────────────────────────────────────────────────────
export type Duration = 'under_24h' | '1_3_days' | '4_7_days' | '1_3_weeks' | 'over_3_weeks';

// ─── Stress Level ────────────────────────────────────────────────────
export type StressLevel = 'low' | 'moderate' | 'high';

// ─── Trigger ─────────────────────────────────────────────────────────
export type Trigger = 'gym' | 'long_sitting' | 'injury' | 'unknown';

// ─── Difficulty ──────────────────────────────────────────────────────
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// ─── Region ──────────────────────────────────────────────────────────
export interface Region {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

// ─── Exercise ────────────────────────────────────────────────────────
export interface Exercise {
  id: string;
  region_id: string;
  title: string;
  instructions: string;
  tags: string[];
  pain_types: string[];
  difficulty: Difficulty;
  duration_min: number | null;
  created_at?: string;
}

/** Exercise as returned in API responses (subset of full Exercise) */
export interface ExerciseResponse {
  title: string;
  instructions: string;
  tags: string[];
}

// ─── Risk Calculator Input ───────────────────────────────────────────
export interface RiskInput {
  region: string;
  painType: PainType;
  duration: Duration;
  intensity: number;
  stressLevel?: StressLevel;
  trigger?: Trigger;
}

// ─── Pain Analyzer Input ────────────────────────────────────────────
export interface AnalyzeInput {
  deviceId: string;
  region: string;
  painType: PainType;
  duration: Duration;
  intensity: number;
  stressLevel?: StressLevel;
  trigger?: Trigger;
}

// ─── Acupressure Point ──────────────────────────────────────────────
export interface AcupressurePoint {
  name: string;
  position: [number, number, number];
  description: string;
  technique: string;
}

// ─── Pain Analyzer Output ───────────────────────────────────────────
export interface AnalyzeOutput {
  regionName: string;
  muscles: string[];
  exercises: ExerciseResponse[];
  aiInsight: string;              // AI-generated personalized insight
  recoveryTips: string[];         // AI-generated recovery tips
  riskLevel: RiskLevel;
  warningText: string;
  disclaimerText: string;
  acupressurePoints: AcupressurePoint[];  // TCM acupressure data
  generatedBy: string;            // 'gemini-1.5-flash' | 'rule-based-fallback'
}

// ─── Pain Entry (database row) ──────────────────────────────────────
export interface PainEntry {
  id: string;
  device_id: string;
  region: string;
  region_name: string;
  pain_type: string;
  duration: string;
  intensity: number;
  stress_level: string | null;
  trigger: string | null;
  muscles: string;      // JSON string
  exercises: string;    // JSON string
  risk_level: string;
  warning_text: string;
  disclaimer: string;
  created_at: string;
  // EXTENSIBILITY: user_id will be added when auth is implemented
}

// ─── History Response Item ──────────────────────────────────────────
export interface HistoryItem {
  id: string;
  timestamp: string;
  region: string;
  regionName: string;
  intensity: number;
  riskLevel: RiskLevel;
  result: AnalyzeOutput;
}

// ─── Feedback (scaffold for future) ─────────────────────────────────
export interface Feedback {
  id: string;
  entry_id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  // EXTENSIBILITY: This interface is ready for a future "was this helpful?" feature
}

// ─── Exercise Row (raw DB row before JSON parsing) ──────────────────
export interface ExerciseRow {
  id: string;
  region_id: string;
  title: string;
  instructions: string;
  tags: string;         // JSON string in DB
  pain_types: string;   // JSON string in DB
  difficulty: string;
  duration_min: number | null;
  created_at: string;
}
