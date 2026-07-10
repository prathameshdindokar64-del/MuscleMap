/**
 * Calculates risk level from pain inputs.
 * EXTENSIBILITY: Replace this function with an AI API call when ready.
 * Input and output interfaces must remain identical.
 */
import { RiskInput, RiskLevel } from '../types';
import { 
  RED_FLAG_INTENSITY, 
  SEVERE_INTENSITY, 
  MODERATE_INTENSITY, 
  SHARP_PAIN_SEVERE_THRESHOLD, 
  PROLONGED_DURATIONS,
  RED_FLAG_PAIN_TYPES,
  RED_FLAG_SHARP_REGIONS
} from '../constants/riskRules';

export function calculateRisk(input: RiskInput): RiskLevel {
  // Rule 1: Red flag — check first, highest priority
  if (
    RED_FLAG_PAIN_TYPES.includes(input.painType as any) ||
    input.intensity >= RED_FLAG_INTENSITY ||
    (RED_FLAG_SHARP_REGIONS.includes(input.region as any) && input.painType === 'sharp') ||
    (PROLONGED_DURATIONS.includes(input.duration as any) && input.intensity >= SEVERE_INTENSITY)
  ) {
    return 'red_flag';
  }

  // Rule 2: Severe
  if (
    input.intensity >= SEVERE_INTENSITY ||
    PROLONGED_DURATIONS.includes(input.duration as any) ||
    (input.painType === 'sharp' && input.intensity >= SHARP_PAIN_SEVERE_THRESHOLD)
  ) {
    return 'severe';
  }

  // Rule 3: Moderate
  if (
    input.intensity >= MODERATE_INTENSITY ||
    input.duration === '4_7_days' ||
    input.duration === '1_3_weeks' ||
    input.painType === 'burning'
  ) {
    return 'moderate';
  }

  // Rule 4: Mild — default
  return 'mild';
}
