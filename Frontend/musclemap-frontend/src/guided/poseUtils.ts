/**
 * poseUtils.ts
 * Pure, unit-testable 2D/3D pose geometry functions and state machine for rep counting.
 * No UI or MediaPipe runtime dependencies in this file.
 */

export interface Point2D {
  x: number
  y: number
  visibility?: number
}

/**
 * Calculates the angle in degrees at vertex B formed by segments BA and BC.
 * Result is in the range [0, 180].
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360.0 - angle
  }

  return Math.round(angle * 10) / 10
}

export type RepPhase = 'idle' | 'inflection_down' | 'inflection_up'

export interface RepCounterConfig {
  upAngle: number       // e.g. 160 deg (extended)
  downAngle: number     // e.g. 90 deg (flexed)
  minDurationMs?: number // debouncing jitter
}

export interface RepCounterState {
  reps: number
  phase: 'up' | 'down'
  lastRepTimestamp: number
}

export function createRepCounter(config: RepCounterConfig) {
  let reps = 0
  let phase: 'up' | 'down' = 'up'
  let lastRepTimestamp = 0
  const minDurationMs = config.minDurationMs ?? 600

  return {
    /**
     * Updates rep state given current joint angle.
     * Returns true if a full rep was just completed on this frame.
     */
    update(currentAngle: number, timestampMs: number = Date.now()): { completedRep: boolean; count: number; phase: 'up' | 'down' } {
      let completedRep = false

      if (phase === 'up') {
        // Looking to go into down phase
        if (config.downAngle < config.upAngle) {
          // Normal flexion: angle decreases (e.g. squat 170 -> 90)
          if (currentAngle <= config.downAngle) {
            phase = 'down'
          }
        } else {
          // Extension: angle increases (e.g. arm raise 30 -> 150)
          if (currentAngle >= config.downAngle) {
            phase = 'down'
          }
        }
      } else if (phase === 'down') {
        // Looking to return to up phase to complete rep
        const isUp = config.downAngle < config.upAngle
          ? currentAngle >= config.upAngle
          : currentAngle <= config.upAngle

        if (isUp) {
          if (timestampMs - lastRepTimestamp >= minDurationMs) {
            reps += 1
            lastRepTimestamp = timestampMs
            completedRep = true
          }
          phase = 'up'
        }
      }

      return {
        completedRep,
        count: reps,
        phase,
      }
    },
    getReps(): number {
      return reps
    },
    reset() {
      reps = 0
      phase = 'up'
      lastRepTimestamp = 0
    },
  }
}
