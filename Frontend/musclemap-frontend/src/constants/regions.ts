/**
 * ─── ANATOMICAL COORDINATE CONVENTION ────────────────────────────────────
 *
 * The 3D model faces the camera (towards +Z). In anatomical standard view:
 *   • Patient's LEFT  side  =  Viewer's RIGHT  =  +X  in model space
 *   • Patient's RIGHT side  =  Viewer's LEFT   =  -X  in model space
 *
 * All coordinates below follow this convention.
 * Previously, left/right X-signs were INVERTED. Now corrected.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Human-readable labels for each region id (3D detection & API). */
export const REGION_DISPLAY_NAMES: Record<string, string> = {
  neck: 'Neck',
  chest: 'Chest',
  abdomen: 'Abdomen',
  upper_back: 'Upper Back',
  lower_back: 'Lower Back',
  left_shoulder: 'Left Shoulder',
  right_shoulder: 'Right Shoulder',
  left_hip: 'Left Hip',
  right_hip: 'Right Hip',
  left_thigh: 'Left Thigh',
  right_thigh: 'Right Thigh',
  left_knee: 'Left Knee',
  right_knee: 'Right Knee',
  left_calf: 'Left Calf',
  right_calf: 'Right Calf',
  left_ankle: 'Left Ankle',
  right_ankle: 'Right Ankle',
  left_wrist: 'Left Wrist',
  right_wrist: 'Right Wrist',
}

/** Hologram labels grouped by detected region id.
 *  Offset [x, y, z] = anchor position in normalized model-local space.
 *  Left = +X, Right = -X (anatomical convention, corrected from previous inversion).
 */
export const REGION_LABELS: Record<string, { muscle: string; desc: string; offset: [number, number, number] }[]> = {
  neck: [
    { muscle: 'Sternocleidomastoid', desc: 'Rotates and flexes the neck', offset: [-0.28, 1.55, 0.08] },
    { muscle: 'Trapezius (Upper)', desc: 'Elevates the shoulder and neck', offset: [0.3, 1.62, -0.05] },
    { muscle: 'Levator Scapulae', desc: 'Lifts the shoulder blade upward', offset: [0.25, 1.48, -0.1] },
  ],
  chest: [
    { muscle: 'Pectoralis Major', desc: 'Primary chest pushing muscle', offset: [-0.35, 1.22, 0.15] },
    { muscle: 'Pectoralis Minor', desc: 'Stabilizes the shoulder blade', offset: [0.3, 1.15, 0.12] },
    { muscle: 'Serratus Anterior', desc: 'Aids arm movement, wraps ribs', offset: [-0.4, 1.05, 0.1] },
  ],
  abdomen: [
    { muscle: 'Rectus Abdominis', desc: 'The six-pack muscle, flexes trunk', offset: [-0.2, 1.0, 0.14] },
    { muscle: 'External Oblique', desc: 'Rotates and bends the trunk', offset: [0.32, 0.95, 0.1] },
    { muscle: 'Transverse Abdominis', desc: 'Deep core stability muscle', offset: [-0.26, 0.85, 0.1] },
  ],
  upper_back: [
    { muscle: 'Trapezius', desc: 'Controls shoulder and neck movement', offset: [0.32, 1.35, -0.12] },
    { muscle: 'Rhomboids', desc: 'Retracts and rotates shoulder blade', offset: [-0.28, 1.2, -0.14] },
  ],
  lower_back: [{ muscle: 'Erector Spinae', desc: 'Extends and stabilizes the spine', offset: [0.22, 0.95, -0.14] }],
  /* LEFT = +X (patient's left = viewer's right) */
  left_shoulder: [{ muscle: 'Deltoid', desc: 'Raises arm in multiple planes', offset: [0.48, 1.34, 0] }],
  /* RIGHT = -X (patient's right = viewer's left) */
  right_shoulder: [{ muscle: 'Deltoid', desc: 'Raises arm in multiple planes', offset: [-0.48, 1.34, 0] }],
  left_hip: [{ muscle: 'Gluteus Maximus', desc: 'Largest glute, hip extension', offset: [0.24, 0.74, -0.1] }],
  right_hip: [{ muscle: 'Gluteus Maximus', desc: 'Largest glute, hip extension', offset: [-0.24, 0.74, -0.1] }],
  left_thigh: [{ muscle: 'Quadriceps', desc: 'Extends the knee', offset: [0.2, 0.52, 0.1] }],
  right_thigh: [{ muscle: 'Quadriceps', desc: 'Extends the knee', offset: [-0.2, 0.52, 0.1] }],
  left_knee: [{ muscle: 'Patellar Tendon', desc: 'Connects kneecap to tibia', offset: [0.18, 0.33, 0.1] }],
  right_knee: [{ muscle: 'Patellar Tendon', desc: 'Connects kneecap to tibia', offset: [-0.18, 0.33, 0.1] }],
  left_calf: [{ muscle: 'Gastrocnemius', desc: 'Large calf muscle', offset: [0.18, 0.2, -0.1] }],
  right_calf: [{ muscle: 'Gastrocnemius', desc: 'Large calf muscle', offset: [-0.18, 0.2, -0.1] }],
  left_ankle: [{ muscle: 'Achilles Tendon', desc: 'Connects calf to heel', offset: [0.15, 0.1, -0.08] }],
  right_ankle: [{ muscle: 'Achilles Tendon', desc: 'Connects calf to heel', offset: [-0.15, 0.1, -0.08] }],
  left_wrist: [{ muscle: 'Flexor Carpi Radialis', desc: 'Flexes and abducts wrist', offset: [0.48, 0.55, 0.05] }],
  right_wrist: [{ muscle: 'Flexor Carpi Radialis', desc: 'Flexes and abducts wrist', offset: [-0.48, 0.55, 0.05] }],
}

/**
 * 3D spatial anchor coordinates [x, y, z] for each anatomical region in normalized model space.
 * Used by BodyHeatmap and other spatial features.
 *
 * LEFT = +X (patient's left = viewer's right)
 * RIGHT = -X (patient's right = viewer's left)
 *
 * Previously these were INVERTED. Now corrected to match anatomical convention.
 */
export const REGION_COORDINATES: Record<string, [number, number, number]> = {
  neck: [0, 1.58, 0.04],
  chest: [0, 1.25, 0.12],
  upper_back: [0, 1.35, -0.12],
  abdomen: [0, 0.98, 0.12],
  lower_back: [0, 0.95, -0.12],
  /* LEFT = +X */
  left_shoulder: [0.36, 1.34, 0],
  /* RIGHT = -X */
  right_shoulder: [-0.36, 1.34, 0],
  left_hip: [0.18, 0.72, 0.02],
  right_hip: [-0.18, 0.72, 0.02],
  left_thigh: [0.18, 0.52, 0.06],
  right_thigh: [-0.18, 0.52, 0.06],
  left_knee: [0.16, 0.32, 0.08],
  right_knee: [-0.16, 0.32, 0.08],
  left_calf: [0.15, 0.18, -0.06],
  right_calf: [-0.15, 0.18, -0.06],
  left_ankle: [0.14, 0.06, -0.02],
  right_ankle: [-0.14, 0.06, -0.02],
  left_wrist: [0.44, 0.65, 0.02],
  right_wrist: [-0.44, 0.65, 0.02],
}

/** Baseline ergonomic tension hotspots used for demonstration when user has no past assessments. */
export const COMMON_ERGONOMIC_HOTSPOTS: Record<string, number> = {
  lower_back: 3,
  neck: 2,
  upper_back: 2,
  left_shoulder: 1,
  right_shoulder: 1,
}

export const REGION_NAMES = REGION_DISPLAY_NAMES
