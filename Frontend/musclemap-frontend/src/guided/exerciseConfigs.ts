/**
 * exerciseConfigs.ts
 * Config-driven biomechanical rules for camera-based guided exercise mode.
 * Contains landmark configurations, joint angle thresholds, posture hints, and target reps.
 * Supports webcam visibility across all major body regions (neck, shoulders, chest, back, hips, knees, calves).
 */

export interface ExercisePoseConfig {
  id: string
  title: string
  category: 'neck' | 'shoulder' | 'upper_back' | 'lower_back' | 'hip' | 'knee' | 'calf' | 'arm'
  targetReps: number
  landmarks: {
    a: number // first landmark index
    b: number // vertex landmark index
    c: number // third landmark index
  }
  upAngle: number
  downAngle: number
  hintRules: {
    condition: (angle: number) => boolean
    hint: string
    isGood: boolean
  }[]
  instructions: string
  jointLabel: string
}

export const EXERCISE_POSE_CONFIGS: Record<string, ExercisePoseConfig> = {
  // 1. Neck & Cervical Spine (Chin Tuck, Neck Side Stretch, Levator Scapulae)
  neck_stretch: {
    id: 'neck_stretch',
    title: 'Cervical Neck Stretch & Retraction',
    category: 'neck',
    targetReps: 8,
    // Nose (0), Left Shoulder (11), Left Hip (23) -> Cervical lateral/axial alignment
    landmarks: { a: 0, b: 11, c: 23 },
    upAngle: 155,
    downAngle: 130,
    hintRules: [
      {
        condition: (angle) => angle < 120,
        hint: 'Keep neck motion gentle — do not force past comfortable stretch',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 125 && angle <= 145,
        hint: 'Good cervical elongation! Hold smoothly for 2 seconds',
        isGood: true,
      },
      {
        condition: (angle) => angle > 150,
        hint: 'Head upright and aligned over shoulders. Ready for next rep',
        isGood: true,
      },
    ],
    instructions: 'Sit or stand tall. Gently tilt or retract your head to feel a mild release along your cervical muscles, then slowly return to center.',
    jointLabel: 'Neck Angle',
  },

  // 2. Shoulder Elevation & Wall Slides (Wall Slide, Pendulum, Cross-Body, Overhead Slide)
  shoulder_mobility: {
    id: 'shoulder_mobility',
    title: 'Shoulder Mobility & Wall Slides',
    category: 'shoulder',
    targetReps: 10,
    // Left Hip (23), Left Shoulder (11), Left Elbow (13)
    landmarks: { a: 23, b: 11, c: 13 },
    upAngle: 45,
    downAngle: 120,
    hintRules: [
      {
        condition: (angle) => angle > 155,
        hint: 'Do not arch your lower back when reaching overhead',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 110 && angle <= 150,
        hint: 'Excellent shoulder elevation! Feel the shoulder blade glide',
        isGood: true,
      },
      {
        condition: (angle) => angle < 55,
        hint: 'Arms lowered in control. Prepare for next smooth slide',
        isGood: true,
      },
    ],
    instructions: 'Stand tall facing the camera. Smoothly glide your arms up toward shoulder height or overhead, then lower under gentle control.',
    jointLabel: 'Shoulder Angle',
  },

  // 3. Upper Back & Scapular Retraction (Scapular Squeeze, Thoracic Extension, Chest Opener)
  scapular_squeeze: {
    id: 'scapular_squeeze',
    title: 'Scapular Squeeze & Chest Opener',
    category: 'upper_back',
    targetReps: 10,
    // Left Wrist (15), Left Elbow (13), Left Shoulder (11)
    landmarks: { a: 15, b: 13, c: 11 },
    upAngle: 140,
    downAngle: 85,
    hintRules: [
      {
        condition: (angle) => angle < 70,
        hint: 'Keep shoulders relaxed down away from your ears',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 75 && angle <= 100,
        hint: 'Great scapular retraction! Squeeze shoulder blades together',
        isGood: true,
      },
      {
        condition: (angle) => angle > 130,
        hint: 'Chest open, arms extended. Begin next retraction',
        isGood: true,
      },
    ],
    instructions: 'Stand or sit tall. Bend your elbows at 90° and pull your shoulder blades firmly together behind you, then slowly release forward.',
    jointLabel: 'Elbow / Scapula Angle',
  },

  // 4. Lower Back & Lateral Torso (Cat-Cow, Pelvic Tilt, Standing Side Bend, Trunk Stretch)
  torso_bend: {
    id: 'torso_bend',
    title: 'Torso Mobility & Side Bend',
    category: 'lower_back',
    targetReps: 8,
    // Left Shoulder (11), Left Hip (23), Left Knee (25)
    landmarks: { a: 11, b: 23, c: 25 },
    upAngle: 175,
    downAngle: 148,
    hintRules: [
      {
        condition: (angle) => angle < 135,
        hint: 'Keep motion gentle — avoid over-bending into pain',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 140 && angle <= 160,
        hint: 'Optimal lateral spinal release! Hold 2 seconds and breathe',
        isGood: true,
      },
      {
        condition: (angle) => angle > 170,
        hint: 'Torso upright and centered. Prepare for next rep',
        isGood: true,
      },
    ],
    instructions: 'Stand tall with feet hip-width apart. Slowly slide one hand down your outer thigh to gently mobilize your lower back and flank, then return.',
    jointLabel: 'Spine / Hip Angle',
  },

  // 5. Squat & Hip/Knee Strength (Bodyweight Squat, Wall Sit, Chair Squat)
  squat: {
    id: 'squat',
    title: 'Bodyweight Squat & Wall Sit',
    category: 'knee',
    targetReps: 10,
    // Left Hip (23), Left Knee (25), Left Ankle (27)
    landmarks: { a: 23, b: 25, c: 27 },
    upAngle: 165,
    downAngle: 100,
    hintRules: [
      {
        condition: (angle) => angle < 80,
        hint: 'Do not squat too deep — keep knees behind toes to protect joints',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 85 && angle <= 110,
        hint: 'Great depth! Drive smoothly back up through your heels',
        isGood: true,
      },
      {
        condition: (angle) => angle > 155,
        hint: 'Good standing posture. Ready for next rep',
        isGood: true,
      },
    ],
    instructions: 'Stand facing camera about 6-8 feet away. Push hips back and bend knees until thighs are roughly parallel to ground, then stand tall.',
    jointLabel: 'Knee Angle',
  },

  // 6. Hamstring & Standing Knee Flexion (Hamstring Curl, Knee Flexion, Quad Stretch)
  knee_extension: {
    id: 'knee_extension',
    title: 'Standing Knee Flexion & Balance',
    category: 'knee',
    targetReps: 10,
    // Left Hip (23), Left Knee (25), Left Ankle (27)
    landmarks: { a: 23, b: 25, c: 27 },
    upAngle: 165,
    downAngle: 105,
    hintRules: [
      {
        condition: (angle) => angle < 90,
        hint: 'Keep movement smooth and controlled without twisting',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 95 && angle <= 120,
        hint: 'Solid hamstring activation! Return foot steadily to floor',
        isGood: true,
      },
      {
        condition: (angle) => angle > 155,
        hint: 'Balanced posture. Ready for next repetition',
        isGood: true,
      },
    ],
    instructions: 'Holding onto a stable surface for balance if needed, bend one knee backward bringing your heel toward your glute, then lower slowly.',
    jointLabel: 'Knee Flexion Angle',
  },

  // 7. Calf Raises & Ankle Mobility (Calf Raise, Standing Calf Stretch, Soleus Stretch)
  calf_raise: {
    id: 'calf_raise',
    title: 'Calf Raise & Lower Leg Mobility',
    category: 'calf',
    targetReps: 12,
    // Left Knee (25), Left Ankle (27), Left Foot Index (31)
    landmarks: { a: 25, b: 27, c: 31 },
    upAngle: 125,
    downAngle: 95,
    hintRules: [
      {
        condition: (angle) => angle > 135,
        hint: 'Maintain stable ankles — avoid rolling inward or outward',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 115 && angle <= 130,
        hint: 'Great peak calf contraction! Lower heels slowly',
        isGood: true,
      },
      {
        condition: (angle) => angle < 105,
        hint: 'Heels flat on ground. Press up smoothly',
        isGood: true,
      },
    ],
    instructions: 'Stand tall with feet shoulder-width apart. Slowly press up onto the balls of your feet, hold for 1 second, then lower in control.',
    jointLabel: 'Ankle Angle',
  },

  // 8. Lateral Arm Raises & Rotator Cuff (Lateral Arm Raises, Arm Circles, Deltoid Mobility)
  lateral_raises: {
    id: 'lateral_raises',
    title: 'Lateral Arm Raises',
    category: 'arm',
    targetReps: 10,
    // Left Hip (23), Left Shoulder (11), Left Elbow (13)
    landmarks: { a: 23, b: 11, c: 13 },
    upAngle: 35,
    downAngle: 85,
    hintRules: [
      {
        condition: (angle) => angle > 105,
        hint: 'Do not raise arms above shoulder height to avoid impingement',
        isGood: false,
      },
      {
        condition: (angle) => angle >= 80 && angle <= 100,
        hint: 'Perfect shoulder height! Lower smoothly with control',
        isGood: true,
      },
      {
        condition: (angle) => angle < 40,
        hint: 'Arms at sides. Inhale and raise outward smoothly',
        isGood: true,
      },
    ],
    instructions: 'Stand tall with arms at your sides. Slowly raise arms out to the sides until parallel to the floor, pause, and lower slowly.',
    jointLabel: 'Shoulder Elevation Angle',
  },
}

/**
 * Finds the matching guided exercise config for any exercise title,
 * and customizes the returned config with the specific exercise title & instructions.
 */
export function getExerciseConfigForTitle(title: string, userInstructions?: string): ExercisePoseConfig {
  const t = (title || '').toLowerCase()

  let baseConfig: ExercisePoseConfig = EXERCISE_POSE_CONFIGS.shoulder_mobility

  // 1. Neck exercises
  if (t.includes('neck') || t.includes('chin') || t.includes('cervical') || t.includes('tuck') || t.includes('levator')) {
    baseConfig = EXERCISE_POSE_CONFIGS.neck_stretch
  }
  // 2. Upper Back & Chest Opener & Scapula
  else if (t.includes('scapul') || t.includes('squeeze') || t.includes('chest') || t.includes('pec') || t.includes('thoracic') || t.includes('thread') || t.includes('opener')) {
    baseConfig = EXERCISE_POSE_CONFIGS.scapular_squeeze
  }
  // 3. Lower Back & Torso Mobilty
  else if (t.includes('cat') || t.includes('cow') || t.includes('pelvic') || t.includes('tilt') || t.includes('bend') || t.includes('twist') || t.includes('torso') || t.includes('spine') || t.includes('side bend')) {
    baseConfig = EXERCISE_POSE_CONFIGS.torso_bend
  }
  // 4. Squats & Wall Sits
  else if (t.includes('squat') || t.includes('wall sit') || t.includes('quad') || t.includes('chair sit')) {
    baseConfig = EXERCISE_POSE_CONFIGS.squat
  }
  // 5. Hamstrings & Knee Flexion
  else if (t.includes('hamstring') || t.includes('curl') || t.includes('knee') || t.includes('lunge') || t.includes('clamshell') || t.includes('figure')) {
    baseConfig = EXERCISE_POSE_CONFIGS.knee_extension
  }
  // 6. Calf & Ankle
  else if (t.includes('calf') || t.includes('ankle') || t.includes('soleus') || t.includes('heel')) {
    baseConfig = EXERCISE_POSE_CONFIGS.calf_raise
  }
  // 7. Lateral Raises & Arm / Shoulder Elevation
  else if (t.includes('raise') || t.includes('lateral') || t.includes('wrist') || t.includes('arm')) {
    baseConfig = EXERCISE_POSE_CONFIGS.lateral_raises
  }
  // 8. General Shoulder / Upper Body Mobility
  else if (t.includes('shoulder') || t.includes('slide') || t.includes('pendulum') || t.includes('reach')) {
    baseConfig = EXERCISE_POSE_CONFIGS.shoulder_mobility
  }

  // Return a cloned config carrying the exact exercise title & instructions
  return {
    ...baseConfig,
    title: title || baseConfig.title,
    instructions: userInstructions || baseConfig.instructions,
  }
}
