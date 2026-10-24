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

// ─── v2 Extended Types ──────────────────────────────────────────────
export type Onset = 'sudden' | 'gradual';
export type PreviousEpisodes = 'none' | 'once' | 'recurring';
export type SleepQuality = 'good' | 'fair' | 'poor';
export type AggravatingFactor = 'bending' | 'twisting' | 'walking' | 'lifting' | 'sitting' | 'lying_down';

/** Source of the risk level determination */
export type RiskSource = 'rules' | 'ml' | 'rules_override';

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

/** Exercise as returned in API responses (v2 — includes id, video query, guided flag) */
export interface ExerciseResponse {
  id: string;
  title: string;
  instructions: string;
  tags: string[];
  videoSearchQuery: string;
  guidedModeAvailable: boolean;
}

// ─── Risk Calculator Input ───────────────────────────────────────────
export interface RiskInput {
  region: string;
  painType: PainType;
  duration: Duration;
  intensity: number;
  stressLevel?: StressLevel;
  trigger?: Trigger;
  // v2 extended fields
  onset?: Onset;
  radiating?: boolean;
  numbnessOrWeakness?: boolean;
  nightPain?: boolean;
  fever?: boolean;
  bladderBowelChanges?: boolean;
  previousEpisodes?: PreviousEpisodes;
  aggravatedBy?: AggravatingFactor[];
  dailySittingHours?: number;
  sleepQuality?: SleepQuality;
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
  // v2 extended fields
  onset?: Onset;
  radiating?: boolean;
  numbnessOrWeakness?: boolean;
  nightPain?: boolean;
  fever?: boolean;
  bladderBowelChanges?: boolean;
  previousEpisodes?: PreviousEpisodes;
  aggravatedBy?: AggravatingFactor[];
  dailySittingHours?: number;
  sleepQuality?: SleepQuality;
}

// ─── Acupressure Point ──────────────────────────────────────────────
export interface AcupressurePoint {
  name: string;
  position: [number, number, number];
  description: string;
  technique: string;
}

/** Acupressure point as returned by the API (simpler shape for v2) */
export interface AcupressureResponse {
  name: string;
  location: string;
  howTo: string;
}

// ─── Pain Analyzer Output ───────────────────────────────────────────
export interface AnalyzeOutput {
  sessionId: string;
  createdAt: string;
  regionName: string;
  muscles: string[];
  exercises: ExerciseResponse[];
  aiInsight: string;              // AI-generated personalized insight
  recoveryTips: string[];         // AI-generated recovery tips
  riskLevel: RiskLevel;
  warningText: string;
  disclaimerText: string;
  acupressurePoints: AcupressureResponse[];
  generatedBy: string;            // 'gemini-1.5-flash' | 'rule-based-fallback'
  // v2 additions
  redFlagReasons: string[];
  riskSource: RiskSource;
  mlConfidence: number;
  resultHindi?: AnalyzeOutput;
}

// ─── Pain Entry (database row) ──────────────────────────────────────
export interface PainEntry {
  id: string;
  device_id: string;
  region: string;
  regionName?: string;
  region_name: string;
  pain_type: string;
  duration: string;
  intensity: number;
  stress_level: string | null;
  trigger_type: string | null;
  muscles: string;      // JSON string
  exercises: string;    // JSON string
  risk_level: string;
  warning_text: string;
  disclaimer: string;
  created_at: string;
  user_id?: string | null;
  // v2 extended columns
  onset?: string | null;
  radiating?: number | null;          // SQLite boolean
  numbness_or_weakness?: number | null;
  night_pain?: number | null;
  fever?: number | null;
  bladder_bowel_changes?: number | null;
  previous_episodes?: string | null;
  aggravated_by?: string | null;      // JSON string
  daily_sitting_hours?: number | null;
  sleep_quality?: string | null;
  red_flag_reasons?: string | null;   // JSON string
  risk_source?: string | null;
  ml_confidence?: number | null;
  ai_insight?: string | null;
  recovery_tips?: string | null;      // JSON string
  acupressure_points?: string | null; // JSON string
  result_hindi?: string | null;       // JSON string of localized Hindi AnalyzeOutput
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
  resultHindi?: AnalyzeOutput;
}

// ─── Session Response (full detail) ─────────────────────────────────
export interface SessionResponse {
  id: string;
  timestamp: string;
  region: string;
  regionName: string;
  inputs: AnalyzeInput;
  result: AnalyzeOutput;
  resultHindi?: AnalyzeOutput;
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
  guided_mode_available?: number; // SQLite boolean (0/1)
}

// ─── Video Cache Row ────────────────────────────────────────────────
export interface VideoCacheRow {
  exercise_id: string;
  video_id: string;
  video_title: string;
  channel: string;
  fetched_at: string;
}

// ─── Acupressure DB Row ─────────────────────────────────────────────
export interface AcupressureRow {
  id: string;
  region_id: string;
  name: string;
  location: string;
  how_to: string;
}
