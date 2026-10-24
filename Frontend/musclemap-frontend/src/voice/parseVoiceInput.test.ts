/**
 * parseVoiceInput.test.ts
 * Unit tests for parseVoiceInput covering 10+ varied realistic verbal descriptions.
 */

import { describe, it, expect } from 'vitest'
import { parseVoiceInput } from './parseVoiceInput'

describe('parseVoiceInput', () => {
  it('1. parses sharp lower back pain starting yesterday with intensity 7', () => {
    const res = parseVoiceInput('sharp pain in my lower back, started yesterday, intensity seven.')
    expect(res.region).toBe('lower_back')
    expect(res.painType).toBe('sharp')
    expect(res.duration).toBe('under_24h')
    expect(res.intensity).toBe(7)
  })

  it('2. parses aching neck pain from sitting at a desk with intensity 4', () => {
    const res = parseVoiceInput('I have an aching neck from sitting at my desk, intensity is 4 out of 10')
    expect(res.region).toBe('neck')
    expect(res.painType).toBe('aching')
    expect(res.trigger).toBe('long_sitting')
    expect(res.intensity).toBe(4)
  })

  it('3. parses stiffness in right shoulder for 1 to 3 days', () => {
    const res = parseVoiceInput('stiffness in my right shoulder for 1 to 3 days, level 5')
    expect(res.region).toBe('right_shoulder')
    expect(res.painType).toBe('stiffness')
    expect(res.duration).toBe('1_3_days')
    expect(res.intensity).toBe(5)
  })

  it('4. detects red-flag fever with spine pain', () => {
    const res = parseVoiceInput('sudden sharp pain in lumbar area, fever, intensity 8')
    expect(res.region).toBe('lower_back')
    expect(res.painType).toBe('sharp')
    expect(res.onset).toBe('sudden')
    expect(res.fever).toBe(true)
    expect(res.intensity).toBe(8)
  })

  it('5. detects radiating pain with high stress', () => {
    const res = parseVoiceInput('dull ache in my left hip radiating down the leg, high stress, intensity 6')
    expect(res.region).toBe('left_hip')
    expect(res.painType).toBe('dull')
    expect(res.radiating).toBe(true)
    expect(res.stressLevel).toBe('high')
    expect(res.intensity).toBe(6)
  })

  it('6. detects night pain waking the user', () => {
    const res = parseVoiceInput('throbbing pain in my knee, night pain wakes me up, intensity 8')
    expect(res.region).toBe('left_knee')
    expect(res.painType).toBe('aching')
    expect(res.nightPain).toBe(true)
    expect(res.intensity).toBe(8)
  })

  it('7. detects bladder or bowel changes', () => {
    const res = parseVoiceInput('severe lower back pain with numbness and bladder changes')
    expect(res.region).toBe('lower_back')
    expect(res.numbnessOrWeakness).toBe(true)
    expect(res.bladderBowelChanges).toBe(true)
  })

  it('8. detects prolonged sitting hours and wrist pain', () => {
    const res = parseVoiceInput('burning wrist pain after 9 hours of sitting typing on computer, intensity 5')
    expect(res.region).toBe('left_wrist')
    expect(res.painType).toBe('burning')
    expect(res.dailySittingHours).toBe(9)
    expect(res.trigger).toBe('repetitive_motion')
    expect(res.intensity).toBe(5)
  })

  it('9. detects chest tightness after gym workout', () => {
    const res = parseVoiceInput('tightness in chest after heavy gym workout, intensity 6')
    expect(res.region).toBe('chest')
    expect(res.painType).toBe('stiffness')
    expect(res.trigger).toBe('workout')
    expect(res.intensity).toBe(6)
  })

  it('10. detects chronic duration over three weeks in upper back', () => {
    const res = parseVoiceInput('chronic dull pain in my upper back for over a month, intensity 3')
    expect(res.region).toBe('upper_back')
    expect(res.painType).toBe('dull')
    expect(res.duration).toBe('over_3_weeks')
    expect(res.intensity).toBe(3)
  })

  it('11. detects gradual onset with pins and needles', () => {
    const res = parseVoiceInput('gradual tingling and pins and needles in my left shoulder, intensity 4')
    expect(res.region).toBe('left_shoulder')
    expect(res.painType).toBe('numbness')
    expect(res.onset).toBe('gradual')
    expect(res.intensity).toBe(4)
  })
})
