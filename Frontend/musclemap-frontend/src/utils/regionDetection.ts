import type { RegionInfo } from '../types'
import * as THREE from 'three'

/** Detects an anatomical region by normalized model-space point. */
export function detectRegionFromPoint(point: THREE.Vector3): RegionInfo | null {
  if (point.y >= 1.52) return { region: 'neck', name: 'Neck' }
  if (point.y >= 1.2 && point.y < 1.52 && Math.abs(point.x) >= 0.18)
    return point.x < 0 ? { region: 'left_shoulder', name: 'Left Shoulder' } : { region: 'right_shoulder', name: 'Right Shoulder' }
  if (point.y >= 1.05 && point.y < 1.52 && Math.abs(point.x) < 0.18)
    return point.z >= 0 ? { region: 'chest', name: 'Chest' } : { region: 'upper_back', name: 'Upper Back' }
  if (point.y >= 0.7 && point.y < 1.2 && Math.abs(point.x) >= 0.32)
    return point.x < 0 ? { region: 'left_shoulder', name: 'Left Shoulder' } : { region: 'right_shoulder', name: 'Right Shoulder' }
  if (point.y >= 0.82 && point.y < 1.05) return point.z >= 0 ? { region: 'abdomen', name: 'Abdomen' } : { region: 'lower_back', name: 'Lower Back' }
  if (point.y >= 0.62 && point.y < 0.82) return point.x < 0 ? { region: 'left_hip', name: 'Left Hip' } : { region: 'right_hip', name: 'Right Hip' }
  if (point.y >= 0.38 && point.y < 0.7 && Math.abs(point.x) >= 0.32)
    return point.x < 0 ? { region: 'left_wrist', name: 'Left Wrist' } : { region: 'right_wrist', name: 'Right Wrist' }
  if (point.y >= 0.38 && point.y < 0.62) return point.x < 0 ? { region: 'left_thigh', name: 'Left Thigh' } : { region: 'right_thigh', name: 'Right Thigh' }
  if (point.y >= 0.26 && point.y < 0.38) return point.x < 0 ? { region: 'left_knee', name: 'Left Knee' } : { region: 'right_knee', name: 'Right Knee' }
  if (point.y >= 0.1 && point.y < 0.26) return point.x < 0 ? { region: 'left_calf', name: 'Left Calf' } : { region: 'right_calf', name: 'Right Calf' }
  return point.x < 0 ? { region: 'left_ankle', name: 'Left Ankle' } : { region: 'right_ankle', name: 'Right Ankle' }
}
