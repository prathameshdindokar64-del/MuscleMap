/**
 * types/index.ts
 * All shared TypeScript interfaces for MuscleMap frontend.
 * Matches the backend API contract and v2 additions.
 */

export type Onset = 'sudden' | 'gradual'
export type PreviousEpisodes = 'none' | 'once' | 'recurring'
export type SleepQuality = 'good' | 'fair' | 'poor'
export type AggravatingFactor =
  | 'bending'
  | 'twisting'
  | 'walking'
  | 'lifting'
  | 'sitting'
  | 'lying_down'

/** Request body sent to POST /api/analyze-pain */
export interface AnalyzePainRequest {
  deviceId: string
  region: string
  painType: 'dull' | 'sharp' | 'stiffness' | 'burning' | 'numbness' | 'aching'
  duration: 'under_24h' | '1_3_days' | '4_7_days' | '1_3_weeks' | 'over_3_weeks' | 'less_than_1_day' | 'more_than_1_month'
  intensity: number
  stressLevel?: 'low' | 'moderate' | 'high' | number
  trigger?: 'gym' | 'long_sitting' | 'injury' | 'workout' | 'bad_posture' | 'repetitive_motion' | 'stress' | 'unknown'
  // v2 fields
  onset?: Onset
  radiating?: boolean
  numbnessOrWeakness?: boolean
  nightPain?: boolean
  fever?: boolean
  bladderBowelChanges?: boolean
  previousEpisodes?: PreviousEpisodes
  aggravatedBy?: AggravatingFactor[]
  dailySittingHours?: number
  sleepQuality?: SleepQuality
}

/** A single exercise returned in analysis results */
export interface Exercise {
  id?: string
  title: string
  instructions: string
  tags: string[]
  videoSearchQuery?: string
  guidedModeAvailable?: boolean
}

/** Risk level categories */
export type RiskLevel = 'mild' | 'moderate' | 'severe' | 'red_flag'
export type RiskSource = 'rules' | 'ml' | 'rules_override'

/** Acupressure point returned by the API */
export interface AcupressurePoint {
  name: string
  position?: [number, number, number]
  description?: string
  technique?: string
  location?: string
  howTo?: string
}

export interface AcupressureResponse {
  name: string
  location: string
  howTo: string
}

/** Full response from POST /api/analyze-pain */
export interface AnalyzePainResponse {
  sessionId?: string
  createdAt?: string
  regionName: string
  muscles: string[]
  exercises: Exercise[]
  aiInsight: string           // AI-generated narrative insight
  recoveryTips: string[]      // Actionable recovery recommendations
  riskLevel: RiskLevel
  redFlagReasons?: string[]
  riskSource?: RiskSource
  mlConfidence?: number
  warningText: string
  disclaimerText: string
  acupressurePoints: AcupressurePoint[]
  generatedBy: string         // 'gemini-1.5-flash' | 'rule-based-fallback'
  resultHindi?: AnalyzePainResponse
}

/** A single history entry from GET /api/history */
export interface HistoryEntry {
  id: string
  timestamp: string        // ISO date string
  region: string
  regionName: string
  intensity: number
  riskLevel: RiskLevel
  result?: AnalyzePainResponse
  resultHindi?: AnalyzePainResponse
}

/** Full session response from GET /api/sessions/:id */
export interface SessionResponse {
  id: string
  timestamp: string
  region: string
  regionName: string
  inputs: AnalyzePainRequest
  result: AnalyzePainResponse
  resultHindi?: AnalyzePainResponse
}

/** Exercise video response from GET /api/exercises/:id/video */
export interface ExerciseVideoResponse {
  videoId: string | null
  title?: string
  channel?: string
  searchUrl: string
}

/** A body region from GET /api/regions */
export interface Region {
  id: string
  name: string
  description: string
}

/** Internal type used by the 3D region detection system */
export interface RegionInfo {
  region: string
  name: string
}

/** Theme type used by ThemeContext */
export type Theme = 'dark' | 'light'
export type ThemeMode = Theme

/** API error shape returned by backend on failure */
export interface ApiError {
  error: string
  details?: string[]
}

/** Authenticated user profile */
export interface User {
  id: string
  email: string
  name: string
}

/** Response from POST /api/auth/register and POST /api/auth/login */
export interface AuthResponse {
  message: string
  token: string
  user: User
}
