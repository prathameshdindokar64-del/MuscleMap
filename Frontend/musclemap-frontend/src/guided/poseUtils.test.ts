/**
 * poseUtils.test.ts
 * Unit tests for calculateAngle and repCounter state machine.
 */

import { describe, it, expect } from 'vitest'
import { calculateAngle, createRepCounter } from './poseUtils'

describe('calculateAngle', () => {
  it('calculates a 90 degree right angle correctly', () => {
    // A=(0, 1), B=(0, 0), C=(1, 0)
    const a = { x: 0, y: 1 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    const angle = calculateAngle(a, b, c)
    expect(angle).toBe(90)
  })

  it('calculates a 180 degree straight line correctly', () => {
    // A=(-1, 0), B=(0, 0), C=(1, 0)
    const a = { x: -1, y: 0 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    const angle = calculateAngle(a, b, c)
    expect(angle).toBe(180)
  })

  it('calculates acute angle around 45 degrees', () => {
    const a = { x: 1, y: 1 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    const angle = calculateAngle(a, b, c)
    expect(angle).toBe(45)
  })
})

describe('createRepCounter', () => {
  it('counts squat reps from standing (170) to squat (85) and back to standing (165)', () => {
    const counter = createRepCounter({
      upAngle: 160,
      downAngle: 90,
      minDurationMs: 100,
    })

    // Start standing
    let res = counter.update(170, 1000)
    expect(res.count).toBe(0)
    expect(res.phase).toBe('up')

    // Squatting down
    res = counter.update(120, 1200)
    expect(res.phase).toBe('up')

    // Hit bottom depth (<= 90)
    res = counter.update(85, 1400)
    expect(res.phase).toBe('down')
    expect(res.count).toBe(0)

    // Standing back up (>= 160)
    res = counter.update(165, 1600)
    expect(res.completedRep).toBe(true)
    expect(res.count).toBe(1)
    expect(res.phase).toBe('up')

    // Second rep
    counter.update(80, 1800)
    res = counter.update(165, 2000)
    expect(res.completedRep).toBe(true)
    expect(res.count).toBe(2)
  })

  it('prevents jitter/double counting when time between reps is too short', () => {
    const counter = createRepCounter({
      upAngle: 160,
      downAngle: 90,
      minDurationMs: 500,
    })

    // First rep completed at 1000ms
    counter.update(80, 800)
    let res = counter.update(165, 1000)
    expect(res.count).toBe(1)

    // Second rapid bounce within 200ms
    counter.update(80, 1100)
    res = counter.update(165, 1200)
    // Should NOT count yet because 1200 - 1000 = 200ms < 500ms
    expect(res.count).toBe(1)
  })
})
