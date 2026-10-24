/**
 * parseVoiceInput.ts
 * Pure function to extract structured questionnaire fields from a spoken transcript.
 * Uses deterministic keyword and synonym maps (no external LLM or API call).
 */

import type { AnalyzePainRequest, Onset, PreviousEpisodes, SleepQuality, AggravatingFactor } from '../types'

export const VOICE_INPUT_LANG = 'en-US'

export interface ParsedVoiceResult {
  region?: string
  regionName?: string
  painType?: AnalyzePainRequest['painType']
  duration?: AnalyzePainRequest['duration']
  intensity?: number
  stressLevel?: 'low' | 'moderate' | 'high'
  trigger?: AnalyzePainRequest['trigger']
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
  rawTranscript: string
  matchedFields: string[]
}

const REGION_SYNONYMS: Record<string, { id: string; name: string }> = {
  'neck': { id: 'neck', name: 'Neck & Cervical' },
  'cervical': { id: 'neck', name: 'Neck & Cervical' },
  'throat': { id: 'neck', name: 'Neck & Cervical' },
  'nape': { id: 'neck', name: 'Neck & Cervical' },

  'lower back': { id: 'lower_back', name: 'Lower Back (Lumbar)' },
  'low back': { id: 'lower_back', name: 'Lower Back (Lumbar)' },
  'lumbar': { id: 'lower_back', name: 'Lower Back (Lumbar)' },
  'lumbosacral': { id: 'lower_back', name: 'Lower Back (Lumbar)' },

  'upper back': { id: 'upper_back', name: 'Upper Back & Thoracic' },
  'mid back': { id: 'upper_back', name: 'Upper Back & Thoracic' },
  'middle back': { id: 'upper_back', name: 'Upper Back & Thoracic' },
  'thoracic': { id: 'upper_back', name: 'Upper Back & Thoracic' },
  'shoulder blade': { id: 'upper_back', name: 'Upper Back & Thoracic' },
  'shoulder blades': { id: 'upper_back', name: 'Upper Back & Thoracic' },

  'left shoulder': { id: 'left_shoulder', name: 'Left Shoulder' },
  'right shoulder': { id: 'right_shoulder', name: 'Right Shoulder' },
  'shoulder': { id: 'left_shoulder', name: 'Shoulder' },

  'chest': { id: 'chest', name: 'Chest & Pectorals' },
  'pecs': { id: 'chest', name: 'Chest & Pectorals' },
  'breastbone': { id: 'chest', name: 'Chest & Pectorals' },
  'sternum': { id: 'chest', name: 'Chest & Pectorals' },

  'left knee': { id: 'left_knee', name: 'Left Knee' },
  'right knee': { id: 'right_knee', name: 'Right Knee' },
  'knee': { id: 'left_knee', name: 'Knee' },
  'patella': { id: 'left_knee', name: 'Knee' },

  'left hip': { id: 'left_hip', name: 'Left Hip & Glute' },
  'right hip': { id: 'right_hip', name: 'Right Hip & Glute' },
  'hip': { id: 'left_hip', name: 'Hip & Glute' },
  'glute': { id: 'left_hip', name: 'Hip & Glute' },
  'buttock': { id: 'left_hip', name: 'Hip & Glute' },

  'left wrist': { id: 'left_wrist', name: 'Left Wrist & Forearm' },
  'right wrist': { id: 'right_wrist', name: 'Right Wrist & Forearm' },
  'wrist': { id: 'left_wrist', name: 'Wrist & Forearm' },
  'forearm': { id: 'left_wrist', name: 'Wrist & Forearm' },
}

const PAIN_TYPE_SYNONYMS: Record<string, AnalyzePainRequest['painType']> = {
  'sharp': 'sharp',
  'stabbing': 'sharp',
  'piercing': 'sharp',
  'shooting': 'sharp',
  'acute': 'sharp',

  'dull': 'dull',
  'vague': 'dull',

  'aching': 'aching',
  'ache': 'aching',
  'achy': 'aching',
  'sore': 'aching',
  'soreness': 'aching',
  'throbbing': 'aching',

  'stiff': 'stiffness',
  'stiffness': 'stiffness',
  'tight': 'stiffness',
  'tightness': 'stiffness',
  'locked': 'stiffness',

  'burning': 'burning',
  'hot': 'burning',
  'fire': 'burning',
  'on fire': 'burning',

  'numb': 'numbness',
  'numbness': 'numbness',
  'tingling': 'numbness',
  'pins and needles': 'numbness',
}

const DURATION_SYNONYMS: Record<string, AnalyzePainRequest['duration']> = {
  'today': 'under_24h',
  'yesterday': 'under_24h',
  'few hours': 'under_24h',
  'under 24 hours': 'under_24h',
  'less than a day': 'under_24h',
  'less than 24 hours': 'under_24h',
  'less than one day': 'under_24h',
  'hours': 'under_24h',

  'one to three days': '1_3_days',
  '1 to 3 days': '1_3_days',
  'couple days': '1_3_days',
  'few days': '1_3_days',
  'two days': '1_3_days',
  'three days': '1_3_days',

  'four to seven days': '4_7_days',
  '4 to 7 days': '4_7_days',
  'almost a week': '4_7_days',
  'a week': '4_7_days',
  'one week': '4_7_days',
  'several days': '4_7_days',

  'one to three weeks': '1_3_weeks',
  '1 to 3 weeks': '1_3_weeks',
  'two weeks': '1_3_weeks',
  'three weeks': '1_3_weeks',
  'couple weeks': '1_3_weeks',

  'over three weeks': 'over_3_weeks',
  'over a month': 'over_3_weeks',
  'more than a month': 'over_3_weeks',
  'months': 'over_3_weeks',
  'chronic': 'over_3_weeks',
  'long time': 'over_3_weeks',
}

const NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
}

export function parseVoiceInput(transcript: string): ParsedVoiceResult {
  const text = transcript.toLowerCase()
  const matchedFields: string[] = []
  const result: ParsedVoiceResult = {
    rawTranscript: transcript,
    matchedFields,
  }

  // 1. Region detection (longest matches first)
  const sortedRegionKeys = Object.keys(REGION_SYNONYMS).sort((a, b) => b.length - a.length)
  for (const key of sortedRegionKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'i')
    if (regex.test(text)) {
      result.region = REGION_SYNONYMS[key].id
      result.regionName = REGION_SYNONYMS[key].name
      matchedFields.push('region')
      break
    }
  }

  // 2. Pain Type detection
  const sortedPainKeys = Object.keys(PAIN_TYPE_SYNONYMS).sort((a, b) => b.length - a.length)
  for (const key of sortedPainKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'i')
    if (regex.test(text)) {
      result.painType = PAIN_TYPE_SYNONYMS[key]
      matchedFields.push('painType')
      break
    }
  }

  // 3. Duration detection
  const sortedDurationKeys = Object.keys(DURATION_SYNONYMS).sort((a, b) => b.length - a.length)
  for (const key of sortedDurationKeys) {
    if (text.includes(key)) {
      result.duration = DURATION_SYNONYMS[key]
      matchedFields.push('duration')
      break
    }
  }

  // 4. Intensity detection (e.g. "intensity 7", "level 8", "pain 5 out of 10", "intensity seven")
  const intensityPatterns = [
    /(?:intensity|level|pain level|score|rate(?:d)?)\s*(?:is\s*|of\s*)?(\d{1,2}|zero|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s*(?:out of|\/)\s*10)?/i,
    /(\d{1,2})\s*(?:out of|\/)\s*10/i,
    /\b(?:intensity|level)\s*(\d{1,2})\b/i,
  ]

  for (const pattern of intensityPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const val = match[1].toLowerCase()
      let num = NUMBER_WORDS[val] !== undefined ? NUMBER_WORDS[val] : parseInt(val, 10)
      if (!isNaN(num) && num >= 0 && num <= 10) {
        result.intensity = num
        matchedFields.push('intensity')
        break
      }
    }
  }

  // 5. Stress Level detection
  if (text.includes('high stress') || text.includes('very stressed') || text.includes('extremely stressed')) {
    result.stressLevel = 'high'
    matchedFields.push('stressLevel')
  } else if (text.includes('moderate stress') || text.includes('somewhat stressed') || text.includes('bit stressed')) {
    result.stressLevel = 'moderate'
    matchedFields.push('stressLevel')
  } else if (text.includes('low stress') || text.includes('not stressed') || text.includes('no stress')) {
    result.stressLevel = 'low'
    matchedFields.push('stressLevel')
  }

  // 6. Trigger detection (check specific typing/repetitive first, then sitting/desk)
  if (text.includes('repetitive') || text.includes('typing') || text.includes('mouse')) {
    result.trigger = 'repetitive_motion'
    matchedFields.push('trigger')
  } else if (text.includes('workout') || text.includes('gym') || text.includes('exercise') || text.includes('lifting weights')) {
    result.trigger = 'workout'
    matchedFields.push('trigger')
  } else if (text.includes('sitting') || text.includes('desk') || text.includes('computer') || text.includes('screen')) {
    result.trigger = 'long_sitting'
    matchedFields.push('trigger')
  } else if (text.includes('posture') || text.includes('slouching')) {
    result.trigger = 'bad_posture'
    matchedFields.push('trigger')
  } else if (text.includes('injury') || text.includes('fell') || text.includes('accident')) {
    result.trigger = 'injury'
    matchedFields.push('trigger')
  }

  // 7. Onset detection
  if (text.includes('sudden') || text.includes('suddenly') || text.includes('abrupt')) {
    result.onset = 'sudden'
    matchedFields.push('onset')
  } else if (text.includes('gradual') || text.includes('slowly') || text.includes('over time')) {
    result.onset = 'gradual'
    matchedFields.push('onset')
  }

  // 8. Radiating / spread
  if (text.includes('radiating') || text.includes('spreads') || text.includes('shooting down') || text.includes('travels')) {
    result.radiating = true
    matchedFields.push('radiating')
  }

  // 9. Numbness / Weakness
  if (text.includes('weakness') || text.includes('numbness') || text.includes('loss of strength') || text.includes('pins and needles')) {
    result.numbnessOrWeakness = true
    matchedFields.push('numbnessOrWeakness')
  }

  // 10. Night pain
  if (text.includes('night pain') || text.includes('wakes me') || text.includes('waking up at night') || text.includes('hurts while sleeping')) {
    result.nightPain = true
    matchedFields.push('nightPain')
  }

  // 11. Fever
  if (text.includes('fever') || text.includes('temperature') || text.includes('chills')) {
    result.fever = true
    matchedFields.push('fever')
  }

  // 12. Bladder / Bowel
  if (text.includes('bladder') || text.includes('bowel') || text.includes('incontinence')) {
    result.bladderBowelChanges = true
    matchedFields.push('bladderBowelChanges')
  }

  // 13. Sitting hours
  const sittingMatch = text.match(/(\d{1,2})\s*(?:hours|hrs)\s*(?:of\s*)?sitting/i) || text.match(/sitting\s*(?:for\s*)?(\d{1,2})\s*(?:hours|hrs)/i)
  if (sittingMatch && sittingMatch[1]) {
    const hrs = parseInt(sittingMatch[1], 10)
    if (hrs >= 0 && hrs <= 16) {
      result.dailySittingHours = hrs
      matchedFields.push('dailySittingHours')
    }
  }

  return result
}
