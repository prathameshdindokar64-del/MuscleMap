/**
 * Shared TypeScript interfaces for the MuscleMap backend.
 * All types used across the application are defined here to ensure consistency.
 * EXTENSIBILITY: Add new interfaces as features are added (e.g., User, AuthToken, AIResult).
 */
export type RiskLevel = 'mild' | 'moderate' | 'severe' | 'red_flag';
export type PainType = 'dull' | 'sharp' | 'stiffness' | 'burning' | 'numbness';
export type Duration = 'under_24h' | '1_3_days' | '4_7_days' | '1_3_weeks' | 'over_3_weeks';
export type StressLevel = 'low' | 'moderate' | 'high';
export type Trigger = 'gym' | 'long_sitting' | 'injury' | 'unknown';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export interface Region {
    id: string;
    name: string;
    description: string;
    created_at?: string;
}
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
export interface RiskInput {
    region: string;
    painType: PainType;
    duration: Duration;
    intensity: number;
    stressLevel?: StressLevel;
    trigger?: Trigger;
}
export interface AnalyzeInput {
    deviceId: string;
    region: string;
    painType: PainType;
    duration: Duration;
    intensity: number;
    stressLevel?: StressLevel;
    trigger?: Trigger;
}
export interface AnalyzeOutput {
    regionName: string;
    muscles: string[];
    exercises: ExerciseResponse[];
    riskLevel: RiskLevel;
    warningText: string;
    disclaimerText: string;
}
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
    muscles: string;
    exercises: string;
    risk_level: string;
    warning_text: string;
    disclaimer: string;
    created_at: string;
}
export interface HistoryItem {
    id: string;
    timestamp: string;
    region: string;
    regionName: string;
    intensity: number;
    riskLevel: RiskLevel;
    result: AnalyzeOutput;
}
export interface Feedback {
    id: string;
    entry_id: string;
    rating: number | null;
    comment: string | null;
    created_at: string;
}
export interface ExerciseRow {
    id: string;
    region_id: string;
    title: string;
    instructions: string;
    tags: string;
    pain_types: string;
    difficulty: string;
    duration_min: number | null;
    created_at: string;
}
//# sourceMappingURL=index.d.ts.map