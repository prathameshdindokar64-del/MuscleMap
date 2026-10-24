/**
 * hindiTranslator.test.ts
 * Tests for the frontend clinical pure Hindi translator utility and language fallback.
 */

import { describe, it, expect } from 'vitest'
import { getLocalizedAssessment, HINDI_REGION_MAP, HINDI_RISK_MAP } from './hindiTranslator'
import type { AnalyzePainResponse } from '../types'

const mockEnglishAssessment: AnalyzePainResponse = {
  sessionId: 'test-123',
  createdAt: '2026-10-06T10:00:00.000Z',
  regionName: 'Lower Back',
  muscles: ['Erector Spinae', 'Quadratus Lumborum'],
  exercises: [
    {
      title: 'Cat-Cow Stretch',
      instructions: 'Move gently on hands and knees.',
      tags: ['Stretch', 'Mobility'],
    },
  ],
  aiInsight: 'Based on your lower back pain, try gentle mobility.',
  recoveryTips: ['Rest the affected area', 'Apply ice if inflamed'],
  riskLevel: 'moderate',
  redFlagReasons: [],
  riskSource: 'rules',
  mlConfidence: 0,
  warningText: 'Your symptoms suggest moderate pain.',
  disclaimerText: 'Educational only.',
  acupressurePoints: [],
  generatedBy: 'Clinical Rules',
}

describe('Frontend Pure Hindi Translation Helper', () => {
  it('returns original English assessment when language is "en"', () => {
    const res = getLocalizedAssessment(mockEnglishAssessment, 'en', 'lower_back')
    expect(res.regionName).toBe('Lower Back')
    expect(res.warningText).toBe('Your symptoms suggest moderate pain.')
  })

  it('uses resultHindi if already pre-computed from the backend', () => {
    const withHindi: AnalyzePainResponse = {
      ...mockEnglishAssessment,
      resultHindi: {
        ...mockEnglishAssessment,
        regionName: 'कमर और निचली पीठ',
        warningText: 'आपके लक्षण मध्यम स्तर के दर्द का संकेत देते हैं।',
      },
    }

    const res = getLocalizedAssessment(withHindi, 'hi', 'lower_back')
    expect(res.regionName).toBe('कमर और निचली पीठ')
    expect(res.warningText).toContain('मध्यम स्तर')
  })

  it('falls back to local dictionary when resultHindi is not attached', () => {
    const res = getLocalizedAssessment(mockEnglishAssessment, 'hi', 'lower_back')
    expect(res.regionName).toBe('कमर और निचली पीठ')
    expect(res.warningText).toContain('मध्यम स्तर')
    expect(res.disclaimerText).toContain('शैक्षणिक')
    // Exercises must be pure Hindi
    expect(res.exercises[0].title).toBe('मार्जरी-बितिलासन (पीठ को ऊपर-नीचे करने का खिंचाव)')
    expect(res.exercises[0].tags).toContain('खिंचाव')
    // Muscles must be pure Hindi
    expect(res.muscles[0]).toBe('रीढ़ की हड्डी को सीधा सहारा देने वाली मुख्य मांसपेशी')
    // Recovery tips must be pure Hindi
    expect(res.recoveryTips[1]).toContain('बर्फ की कोमल सिकाई')
  })

  it('maps regions and risks to pure Hindi without English characters', () => {
    expect(HINDI_REGION_MAP['neck']).toBe('गर्दन')
    expect(HINDI_REGION_MAP['lower_back']).toBe('कमर और निचली पीठ')
    expect(HINDI_RISK_MAP['moderate']).toBe('मध्यम दर्द')
    expect(HINDI_RISK_MAP['red_flag']).toBe('गंभीर आपातकालीन संकेत')

    // Ensure NO English letters exist in any region name
    for (const name of Object.values(HINDI_REGION_MAP)) {
      expect(/[a-zA-Z]/.test(name)).toBe(false)
    }
  })
})
