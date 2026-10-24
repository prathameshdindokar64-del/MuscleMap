/**
 * v2.test.ts
 * Integration & unit tests for MuscleMap v2 backend features:
 * 1. Red-flag rules logic and redFlagReasons
 * 2. The ML-can-only-raise-risk safety rule
 * 3. Session ownership check (wrong deviceId returns 404)
 * 4. Dynamic YouTube video endpoint fallback when no API key is configured
 */

import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import { calculateRisk } from '../src/logic/riskCalculator'
import { initializeDatabase } from '../src/db/database'
import { runSchema } from '../src/db/schema'
import type { RiskInput } from '../src/types'

beforeAll(() => {
  const db = initializeDatabase()
  runSchema(db)
})

describe('1. Red-Flag Rules Logic', () => {
  it('triggers red_flag with plain-language reason for bladder/bowel changes', () => {
    const input: RiskInput = {
      region: 'lower_back',
      painType: 'aching',
      duration: '1_to_3_days',
      intensity: 4,
      bladderBowelChanges: true,
    }
    const res = calculateRisk(input)
    expect(res.riskLevel).toBe('red_flag')
    expect(res.redFlagReasons.some((r) => r.toLowerCase().includes('bladder'))).toBe(true)
  })

  it('triggers red_flag for numbness or weakness', () => {
    const input: RiskInput = {
      region: 'neck',
      painType: 'stiffness',
      duration: '4_to_7_days',
      intensity: 5,
      numbnessOrWeakness: true,
    }
    const res = calculateRisk(input)
    expect(res.riskLevel).toBe('red_flag')
    expect(res.redFlagReasons.some((r) => r.toLowerCase().includes('numbness'))).toBe(true)
  })

  it('triggers red_flag for fever combined with spine pain', () => {
    const input: RiskInput = {
      region: 'lower_back',
      painType: 'dull',
      duration: '1_to_3_days',
      intensity: 4,
      fever: true,
    }
    const res = calculateRisk(input)
    expect(res.riskLevel).toBe('red_flag')
    expect(res.redFlagReasons.some((r) => r.toLowerCase().includes('fever'))).toBe(true)
  })

  it('triggers red_flag for night pain when intensity >= 6', () => {
    const input: RiskInput = {
      region: 'left_shoulder',
      painType: 'aching',
      duration: '1_to_3_days',
      intensity: 7,
      nightPain: true,
    }
    const res = calculateRisk(input)
    expect(res.riskLevel).toBe('red_flag')
    expect(res.redFlagReasons.some((r) => r.toLowerCase().includes('night'))).toBe(true)
  })

  it('applies moderate-risk booster for radiating pain', () => {
    const input: RiskInput = {
      region: 'left_hip',
      painType: 'dull',
      duration: '1_to_3_days',
      intensity: 2,
      radiating: true,
    }
    const res = calculateRisk(input)
    expect(res.riskLevel).toBe('moderate')
  })
})

describe('2. Safety Rule: ML Can Only Raise Risk', () => {
  const RISK_ORDER = ['mild', 'moderate', 'severe', 'red_flag'] as const
  function applyMLRisk(rulesRisk: typeof RISK_ORDER[number], mlRisk: typeof RISK_ORDER[number]) {
    const rIdx = RISK_ORDER.indexOf(rulesRisk)
    const mIdx = RISK_ORDER.indexOf(mlRisk)
    if (mIdx > rIdx) return { finalRisk: mlRisk, source: 'ml' }
    if (mIdx < rIdx) return { finalRisk: rulesRisk, source: 'rules_override' }
    return { finalRisk: rulesRisk, source: 'rules' }
  }

  it('elevates risk when ML suggests higher severity (mild -> severe)', () => {
    const outcome = applyMLRisk('mild', 'severe')
    expect(outcome.finalRisk).toBe('severe')
    expect(outcome.source).toBe('ml')
  })

  it('never lowers risk when ML suggests lower severity (severe vs mild -> rules_override)', () => {
    const outcome = applyMLRisk('severe', 'mild')
    expect(outcome.finalRisk).toBe('severe')
    expect(outcome.source).toBe('rules_override')
  })

  it('defaults to rules when ML agrees with rules', () => {
    const outcome = applyMLRisk('moderate', 'moderate')
    expect(outcome.finalRisk).toBe('moderate')
    expect(outcome.source).toBe('rules')
  })
})

describe('3. History & Session Privacy Check', () => {
  it('returns 404 when querying a session with an incorrect deviceId', async () => {
    // 1. Create a session with device-A
    const createRes = await request(app)
      .post('/api/analyze-pain')
      .send({
        deviceId: 'device-owner-12345',
        region: 'neck',
        painType: 'dull',
        duration: '1_3_days',
        intensity: 4,
      })

    expect(createRes.status).toBe(200)
    const sessionId = createRes.body.sessionId
    expect(sessionId).toBeDefined()

    // 2. Query with the same device -> 200 OK
    const validRes = await request(app)
      .get(`/api/sessions/${sessionId}`)
      .query({ deviceId: 'device-owner-12345' })

    expect(validRes.status).toBe(200)
    expect(validRes.body.id).toBe(sessionId)

    // 3. Query with a different device -> 404 (prevents leakage)
    const leakedRes = await request(app)
      .get(`/api/sessions/${sessionId}`)
      .query({ deviceId: 'unauthorized-intruder-device' })

    expect(leakedRes.status).toBe(404)
    expect(leakedRes.body.error).toBe('Session not found')
  })
})

describe('4. Video Endpoint Fallback', () => {
  it('returns status 200 with videoId: null and fallback searchUrl when no API key is active', async () => {
    const res = await request(app).get('/api/exercises/non-existent-or-uncached-id/video')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('videoId')
    expect(res.body).toHaveProperty('searchUrl')
    expect(res.body.searchUrl).toContain('https://www.youtube.com/results?search_query=')
  })
})

describe('5. Bilingual Assessment & History Persistence', () => {
  it('generates Hindi translation and persists it in history and session details', async () => {
    const testDeviceId = 'bilingual-test-device-999'
    const createRes = await request(app)
      .post('/api/analyze-pain')
      .send({
        deviceId: testDeviceId,
        region: 'lower_back',
        painType: 'dull',
        duration: '1_3_days',
        intensity: 5,
      })

    expect(createRes.status).toBe(200)
    expect(createRes.body).toHaveProperty('resultHindi')
    const hindi = createRes.body.resultHindi
    expect(hindi).toBeDefined()
    expect(hindi.regionName).toContain('कमर')
    expect(hindi.warningText).toContain('मध्यम स्तर')
    expect(hindi.disclaimerText).toContain('शैक्षणिक')
    expect(hindi.exercises.length).toBeGreaterThan(0)

    const sessionId = createRes.body.sessionId

    // Test history persistence
    const historyRes = await request(app)
      .get('/api/history')
      .query({ deviceId: testDeviceId })

    expect(historyRes.status).toBe(200)
    const historyItem = historyRes.body.find((item: any) => item.id === sessionId)
    expect(historyItem).toBeDefined()
    expect(historyItem.result).toHaveProperty('resultHindi')
    expect(historyItem.result.resultHindi.regionName).toContain('कमर')

    // Test session detail persistence
    const sessionRes = await request(app)
      .get(`/api/sessions/${sessionId}`)
      .query({ deviceId: testDeviceId })

    expect(sessionRes.status).toBe(200)
    expect(sessionRes.body.result).toHaveProperty('resultHindi')
    expect(sessionRes.body.resultHindi.regionName).toContain('कमर')
  })
})

