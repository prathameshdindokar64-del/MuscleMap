/**
 * Static acupressure point positions in normalized model space.
 * Used when the API does not return point coordinates.
 */
import type { AcupressurePoint } from '../types'

/**
 * Merges API acupressure data with static coordinates for the 3D scene.
 */
export function resolveAcupressurePointsForRegion(regionId: string, apiPoints?: AcupressurePoint[]): AcupressurePoint[] {
  const staticPts = ACUPRESSURE_POINTS[regionId] ?? []
  if (!apiPoints?.length) return staticPts
  const resolved: AcupressurePoint[] = []
  for (const ap of apiPoints) {
    const position = ap.position ?? staticPts.find((s) => s.name === ap.name)?.position ?? [0, 0, 0] as [number, number, number]
    resolved.push({ ...ap, position })
  }
  return resolved.length ? resolved : staticPts
}

/**
 * List for the results panel — prefers API copy, falls back to static descriptions.
 */
export function acupressurePointsForResults(regionId: string, apiPoints?: AcupressurePoint[]): AcupressurePoint[] {
  const staticPts = ACUPRESSURE_POINTS[regionId] ?? []
  if (!apiPoints?.length) return staticPts
  return apiPoints.map((ap) => {
    const match = staticPts.find((s) => s.name === ap.name)
    const position: [number, number, number] = ap.position ?? match?.position ?? [0, 0, 0]
    return {
      name: ap.name,
      description: ap.description || match?.description || '',
      technique: ap.technique || match?.technique || '',
      position,
    }
  })
}

export const ACUPRESSURE_POINTS: Record<string, AcupressurePoint[]> = {
  neck: [
    {
      name: 'GB21 — Shoulder Well',
      position: [-0.18, 1.48, -0.05],
      description: 'Relieves neck tension and headaches',
      technique: 'Apply firm downward pressure with thumb for 30 seconds. Breathe deeply.',
    },
    {
      name: 'BL10 — Heavenly Pillar',
      position: [0.06, 1.58, -0.08],
      description: 'Reduces stiff neck and occipital pain',
      technique: 'Press inward and slightly upward with both thumbs simultaneously for 60 seconds.',
    },
    {
      name: 'LI4 — Union Valley',
      position: [-0.52, 0.62, 0.04],
      description: 'General pain relief point — effective for upper body pain',
      technique: 'Pinch the webbing between thumb and index finger firmly for 30–60 seconds.',
    },
  ],
  lower_back: [
    {
      name: 'BL23 — Kidney Shu',
      position: [0.06, 0.92, -0.12],
      description: 'Primary point for lower back pain relief',
      technique: 'Apply firm pressure with both thumbs on either side of the spine for 60 seconds.',
    },
    {
      name: 'BL40 — Commanding Middle',
      position: [-0.08, 0.28, -0.1],
      description: 'Relieves acute lower back spasm',
      technique: 'Press firmly into the center of the back of the knee for 30 seconds per side.',
    },
    {
      name: 'GV4 — Life Gate',
      position: [0.0, 0.9, -0.13],
      description: 'Strengthens and warms the lower back',
      technique: 'Apply sustained pressure with one thumb directly on the spine between L2-L3 for 60 seconds.',
    },
  ],
  chest: [
    {
      name: 'CV17 — Sea of Tranquility',
      position: [0.0, 1.18, 0.13],
      description: 'Relieves chest tightness and breathing difficulty',
      technique: 'Press gently on the sternum at heart level for 60 seconds while breathing slowly.',
    },
    {
      name: 'LU1 — Central Treasury',
      position: [-0.22, 1.32, 0.08],
      description: 'Opens the chest and relieves pectoral tension',
      technique: 'Press firmly below the collarbone just inside the shoulder for 30 seconds per side.',
    },
  ],
  left_shoulder: [
    {
      name: 'LI15 — Shoulder Bone',
      position: [-0.42, 1.42, 0.04],
      description: 'Relieves shoulder pain and restricted movement',
      technique: 'Press firmly into the front of the shoulder joint for 30 seconds with thumb.',
    },
    {
      name: 'GB21 — Shoulder Well',
      position: [-0.28, 1.46, -0.04],
      description: 'Releases trapezius and shoulder tension',
      technique: 'Apply downward pressure on the highest point of the shoulder for 30 seconds.',
    },
    {
      name: 'SI9 — True Shoulder',
      position: [-0.38, 1.28, -0.06],
      description: 'Relieves posterior shoulder and rotator cuff pain',
      technique: 'Press into the back of the shoulder just below the joint for 30 seconds.',
    },
  ],
  right_shoulder: [
    {
      name: 'LI15 — Shoulder Bone',
      position: [0.42, 1.42, 0.04],
      description: 'Relieves shoulder pain and restricted movement',
      technique: 'Press firmly into the front of the shoulder joint for 30 seconds with thumb.',
    },
    {
      name: 'GB21 — Shoulder Well',
      position: [0.28, 1.46, -0.04],
      description: 'Releases trapezius and shoulder tension',
      technique: 'Apply downward pressure on the highest point of the shoulder for 30 seconds.',
    },
    {
      name: 'SI9 — True Shoulder',
      position: [0.38, 1.28, -0.06],
      description: 'Relieves posterior shoulder and rotator cuff pain',
      technique: 'Press into the back of the shoulder just below the joint for 30 seconds.',
    },
  ],
  upper_back: [
    {
      name: 'BL13 — Lung Shu',
      position: [0.07, 1.28, -0.12],
      description: 'Relieves upper back and respiratory tension',
      technique: 'Apply pressure on both sides of the spine at shoulder blade level for 60 seconds.',
    },
    {
      name: 'BL15 — Heart Shu',
      position: [-0.07, 1.18, -0.12],
      description: 'Releases mid-upper back tension',
      technique: 'Press firmly on both sides of the thoracic spine for 30–60 seconds.',
    },
  ],
  abdomen: [
    {
      name: 'CV6 — Sea of Energy',
      position: [0.0, 0.96, 0.13],
      description: 'Strengthens core and relieves abdominal tension',
      technique: 'Press 2 finger-widths below the navel with moderate pressure for 60 seconds.',
    },
    {
      name: 'ST25 — Heavenly Pivot',
      position: [-0.1, 0.97, 0.12],
      description: 'Relieves abdominal cramping and bloating',
      technique: 'Press firmly 2 finger-widths to the side of the navel for 30 seconds per side.',
    },
  ],
  left_hip: [
    {
      name: 'GB30 — Jumping Round',
      position: [-0.28, 0.72, -0.1],
      description: 'Primary point for hip, glute, and sciatic pain',
      technique:
        'Apply deep firm pressure into the center of the gluteal muscle for 60 seconds. May feel radiating sensation down the leg — this is normal.',
    },
    {
      name: 'BL54 — Middle of the Crook',
      position: [-0.1, 0.3, -0.1],
      description: 'Relieves hip and lower back radiating pain',
      technique: 'Press the center of the crease behind the knee for 30 seconds.',
    },
  ],
  right_hip: [
    {
      name: 'GB30 — Jumping Round',
      position: [0.28, 0.72, -0.1],
      description: 'Primary point for hip, glute, and sciatic pain',
      technique: 'Apply deep firm pressure into the center of the gluteal muscle for 60 seconds.',
    },
    {
      name: 'BL54 — Middle of the Crook',
      position: [0.1, 0.3, -0.1],
      description: 'Relieves hip and lower back radiating pain',
      technique: 'Press the center of the crease behind the knee for 30 seconds.',
    },
  ],
  left_knee: [
    {
      name: 'ST35 — Calf Nose',
      position: [-0.12, 0.33, 0.1],
      description: 'Relieves knee pain and stiffness',
      technique: 'Press into the depression on either side of the kneecap for 30 seconds per side.',
    },
    {
      name: 'SP9 — Yin Mound Spring',
      position: [-0.14, 0.3, 0.06],
      description: 'Reduces knee swelling and medial knee pain',
      technique: 'Press into the depression below and inside the knee for 30–60 seconds.',
    },
  ],
  right_knee: [
    {
      name: 'ST35 — Calf Nose',
      position: [0.12, 0.33, 0.1],
      description: 'Relieves knee pain and stiffness',
      technique: 'Press into the depression on either side of the kneecap for 30 seconds per side.',
    },
    {
      name: 'SP9 — Yin Mound Spring',
      position: [0.14, 0.3, 0.06],
      description: 'Reduces knee swelling and medial knee pain',
      technique: 'Press into the depression below and inside the knee for 30–60 seconds.',
    },
  ],
  left_ankle: [
    {
      name: 'KD3 — Great Ravine',
      position: [-0.1, 0.1, -0.06],
      description: 'Primary ankle and Achilles pain point',
      technique: 'Press into the depression between the inner ankle bone and Achilles tendon for 60 seconds.',
    },
    {
      name: 'BL60 — Kunlun Mountains',
      position: [-0.12, 0.1, -0.06],
      description: 'Relieves ankle stiffness and heel pain',
      technique: 'Press between the outer ankle bone and Achilles tendon for 30 seconds.',
    },
  ],
  right_ankle: [
    {
      name: 'KD3 — Great Ravine',
      position: [0.1, 0.1, -0.06],
      description: 'Primary ankle and Achilles pain point',
      technique: 'Press into the depression between the inner ankle bone and Achilles tendon for 60 seconds.',
    },
    {
      name: 'BL60 — Kunlun Mountains',
      position: [0.12, 0.1, -0.06],
      description: 'Relieves ankle stiffness and heel pain',
      technique: 'Press between the outer ankle bone and Achilles tendon for 30 seconds.',
    },
  ],
  left_thigh: [
    {
      name: 'ST34 — Beam Mound',
      position: [-0.14, 0.42, 0.08],
      description: 'Relieves acute thigh and quadricep pain',
      technique: 'Press firmly 3 finger-widths above the kneecap on the outer quad for 30 seconds.',
    },
  ],
  right_thigh: [
    {
      name: 'ST34 — Beam Mound',
      position: [0.14, 0.42, 0.08],
      description: 'Relieves acute thigh and quadricep pain',
      technique: 'Press firmly 3 finger-widths above the kneecap on the outer quad for 30 seconds.',
    },
  ],
  left_calf: [
    {
      name: 'BL57 — Support Mountain',
      position: [-0.1, 0.18, -0.1],
      description: 'Relieves calf cramps and Achilles tension',
      technique: 'Press firmly into the center of the calf muscle belly for 30–60 seconds.',
    },
  ],
  right_calf: [
    {
      name: 'BL57 — Support Mountain',
      position: [0.1, 0.18, -0.1],
      description: 'Relieves calf cramps and Achilles tension',
      technique: 'Press firmly into the center of the calf muscle belly for 30–60 seconds.',
    },
  ],
}
