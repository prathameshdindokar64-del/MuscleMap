/**
 * types/index.ts
 * All shared TypeScript interfaces for MuscleMap frontend.
 * These match the backend API contract exactly.
 * Update both sides together whenever the API contract changes.
 */

/** Request body sent to POST /api/analyze-pain */
export interface AnalyzePainRequest {
  deviceId: string
  region: string
  painType: 'dull' | 'sharp' | 'stiffness' | 'burning' | 'numbness'
  duration: 'under_24h' | '1_3_days' | '4_7_days' | '1_3_weeks' | 'over_3_weeks'
  intensity: number
  stressLevel?: 'low' | 'moderate' | 'high'
  trigger?: 'gym' | 'long_sitting' | 'injury' | 'unknown'
}

/** A single exercise returned in analysis results */
export interface Exercise {
  title: string
  instructions: string
  tags: string[]
}

/** Risk level categories */
export type RiskLevel = 'mild' | 'moderate' | 'severe' | 'red_flag'

/** Acupressure point returned by the API or mapped locally */
export interface AcupressurePoint {
  name: string
  position: [number, number, number]
  description: string
  technique: string
}

/** Full response from POST /api/analyze-pain */
export interface AnalyzePainResponse {
  regionName: string
  muscles: string[]
  exercises: Exercise[]
  aiInsight: string           // AI-generated narrative insight
  recoveryTips: string[]      // Actionable recovery recommendations
  riskLevel: RiskLevel
  warningText: string
  disclaimerText: string
  acupressurePoints: AcupressurePoint[]  // Acupressure points for the region
  generatedBy: string         // 'gemini' | 'rule-based'
}

/** A single history entry from GET /api/history */
export interface HistoryEntry {
  id: string
  timestamp: string        // ISO date string
  region: string
  regionName: string
  intensity: number
  riskLevel: RiskLevel
  result: AnalyzePainResponse
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

/** Alias for theme mode (used by ThemeProvider) */
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
