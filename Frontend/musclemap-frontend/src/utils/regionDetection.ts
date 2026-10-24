import type { RegionInfo } from '../types'
import * as THREE from 'three'

/**
 * ─── ANATOMICAL PERSPECTIVE CONVENTION ───────────────────────────────────
 *
 * The 3D model faces the camera (looking towards +Z). The camera is at
 * approximately [0, 0.85, +2.6], so the viewer sees the FRONT of the body.
 *
 * In anatomical standard view (patient facing viewer):
 *   • Patient's LEFT  side  =  Viewer's RIGHT  =  +X  in world/model space
 *   • Patient's RIGHT side  =  Viewer's LEFT   =  -X  in world/model space
 *
 * The old code had this BACKWARDS (point.x < 0 → left_*, point.x > 0 → right_*).
 * This is now corrected: point.x > 0 → left_*, point.x < 0 → right_*.
 *
 * ─── WORLD-SPACE vs LOCAL-SPACE ──────────────────────────────────────────
 *
 * event.point from React Three Fiber is in WORLD space. But the anatomy
 * model sits inside a <group> that has continuous oscillating rotation &
 * position animation (useFrame). That means world-space coordinates drift
 * over time, causing massive spatial offsets (clicking bicep → ankle).
 *
 * Fix: The AnatomyModel component now passes the group ref's worldToLocal()
 * transform on the hit point before calling this function, so `point` is
 * always in stable, normalized model-local space.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** All 19 valid anatomical region IDs. */
export const VALID_REGION_IDS = [
  'neck',
  'chest',
  'upper_back',
  'abdomen',
  'lower_back',
  'left_shoulder',
  'right_shoulder',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_thigh',
  'right_thigh',
  'left_knee',
  'right_knee',
  'left_calf',
  'right_calf',
  'left_ankle',
  'right_ankle',
] as const

/**
 * Helper: Determines the laterality label using corrected anatomical perspective.
 * In anatomical position facing the viewer:
 *   +X = patient's LEFT,  -X = patient's RIGHT.
 */
function lateral(x: number): 'left' | 'right' {
  // Anatomical convention: +X = patient's left, -X = patient's right
  return x >= 0 ? 'left' : 'right'
}

/**
 * Detects an anatomical region from a point in normalized model-local space.
 *
 * The model is normalized to ~1.78 units tall, feet at Y≈0, head top at Y≈1.78.
 * X=0 is the body midline. Z>0 is the front (anterior), Z<0 is the back (posterior).
 *
 * @param point - The intersection point in LOCAL model space (after worldToLocal).
 * @returns The matching RegionInfo, or null if outside all defined zones.
 */
export function detectRegionFromPoint(point: THREE.Vector3): RegionInfo | null {
  const { x, y, z } = point
  const absX = Math.abs(x)

  // ── Debug logging: always log to help diagnose hit detection ──
  console.debug(
    `[RegionDetect] Local point: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})  |x|=${absX.toFixed(3)}`
  )

  // ────────────────────────────────────────────────────────────────
  // HEAD & NECK  (Y ≥ 1.52)
  // ────────────────────────────────────────────────────────────────
  if (y >= 1.52) {
    const region: RegionInfo = { region: 'neck', name: 'Neck' }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // SHOULDER ZONE  (1.20 ≤ Y < 1.52, |X| ≥ 0.18)
  //   Arms extend laterally from the torso
  // ────────────────────────────────────────────────────────────────
  if (y >= 1.20 && y < 1.52 && absX >= 0.18) {
    const side = lateral(x)
    const region: RegionInfo = {
      region: `${side}_shoulder`,
      name: `${side === 'left' ? 'Left' : 'Right'} Shoulder`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // CHEST / UPPER BACK  (1.05 ≤ Y < 1.52, |X| < 0.18  → midline torso)
  //   Front (Z ≥ 0) = Chest,  Back (Z < 0) = Upper Back
  // ────────────────────────────────────────────────────────────────
  if (y >= 1.05 && y < 1.52 && absX < 0.18) {
    if (z >= 0) {
      const region: RegionInfo = { region: 'chest', name: 'Chest' }
      console.debug(`[RegionDetect] → ${region.region}`)
      return region
    }
    const region: RegionInfo = { region: 'upper_back', name: 'Upper Back' }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // UPPER ARM / WRIST ZONE  (0.70 ≤ Y < 1.20, |X| ≥ 0.30)
  //   This catches the forearm/wrist area that extends outward.
  //   At this Y-range, high |X| means the arm, not the torso.
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.70 && y < 1.20 && absX >= 0.30) {
    const side = lateral(x)
    // Upper portion of this range = shoulder, lower = wrist/forearm
    if (y >= 0.95) {
      const region: RegionInfo = {
        region: `${side}_shoulder`,
        name: `${side === 'left' ? 'Left' : 'Right'} Shoulder`,
      }
      console.debug(`[RegionDetect] → ${region.region} (upper arm)`)
      return region
    }
    const region: RegionInfo = {
      region: `${side}_wrist`,
      name: `${side === 'left' ? 'Left' : 'Right'} Wrist`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // ABDOMEN / LOWER BACK  (0.82 ≤ Y < 1.05, within torso width)
  //   Front (Z ≥ 0) = Abdomen,  Back (Z < 0) = Lower Back
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.82 && y < 1.05) {
    if (z >= 0) {
      const region: RegionInfo = { region: 'abdomen', name: 'Abdomen' }
      console.debug(`[RegionDetect] → ${region.region}`)
      return region
    }
    const region: RegionInfo = { region: 'lower_back', name: 'Lower Back' }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // HIP ZONE  (0.62 ≤ Y < 0.82)
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.62 && y < 0.82) {
    const side = lateral(x)
    const region: RegionInfo = {
      region: `${side}_hip`,
      name: `${side === 'left' ? 'Left' : 'Right'} Hip`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // LOWER WRIST ZONE  (0.38 ≤ Y < 0.70, |X| ≥ 0.30)
  //   At this Y-range, high lateral offset = forearm/wrist, not legs
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.38 && y < 0.70 && absX >= 0.30) {
    const side = lateral(x)
    const region: RegionInfo = {
      region: `${side}_wrist`,
      name: `${side === 'left' ? 'Left' : 'Right'} Wrist`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // THIGH  (0.38 ≤ Y < 0.62, within leg width)
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.38 && y < 0.62) {
    const side = lateral(x)
    const region: RegionInfo = {
      region: `${side}_thigh`,
      name: `${side === 'left' ? 'Left' : 'Right'} Thigh`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // KNEE  (0.26 ≤ Y < 0.38)
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.26 && y < 0.38) {
    const side = lateral(x)
    const region: RegionInfo = {
      region: `${side}_knee`,
      name: `${side === 'left' ? 'Left' : 'Right'} Knee`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // CALF  (0.10 ≤ Y < 0.26)
  // ────────────────────────────────────────────────────────────────
  if (y >= 0.10 && y < 0.26) {
    const side = lateral(x)
    const region: RegionInfo = {
      region: `${side}_calf`,
      name: `${side === 'left' ? 'Left' : 'Right'} Calf`,
    }
    console.debug(`[RegionDetect] → ${region.region}`)
    return region
  }

  // ────────────────────────────────────────────────────────────────
  // ANKLE / FOOT  (Y < 0.10)
  // ────────────────────────────────────────────────────────────────
  const side = lateral(x)
  const region: RegionInfo = {
    region: `${side}_ankle`,
    name: `${side === 'left' ? 'Left' : 'Right'} Ankle`,
  }
  console.debug(`[RegionDetect] → ${region.region}`)
  return region
}
