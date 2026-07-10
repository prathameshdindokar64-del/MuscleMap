/** UI constants for questionnaire options and section labels. */
export const SECTION_LABELS = [
  { start: 15, end: 30, label: 'UPPER BODY' },
  { start: 30, end: 50, label: 'CORE' },
  { start: 50, end: 70, label: 'LOWER BODY' },
  { start: 70, end: 90, label: 'LEGS' },
]

export const PAIN_TYPES = [
  { id: 'dull', label: 'Dull Ache' },
  { id: 'sharp', label: 'Sharp/Stabbing' },
  { id: 'stiffness', label: 'Stiffness' },
  { id: 'burning', label: 'Burning' },
  { id: 'numbness', label: 'Numbness' },
] as const

export const DURATION_OPTIONS = [
  { id: 'under_24h', label: 'Under 24hrs' },
  { id: '1_3_days', label: '1-3 Days' },
  { id: '4_7_days', label: '4-7 Days' },
  { id: '1_3_weeks', label: '1-3 Weeks' },
  { id: 'over_3_weeks', label: 'Over 3 Weeks' },
] as const

export const STRESS_LEVELS = ['low', 'moderate', 'high'] as const
export const TRIGGERS = ['gym', 'long_sitting', 'injury', 'unknown'] as const
