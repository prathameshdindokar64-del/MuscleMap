const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = new Database('./musclemap.sqlite');

// 1. Create or update Demo User
const email = 'judge@musclemap.com';
const password = 'judge123';
const name = 'Dr. Alex Vance (Clinical Reviewer)';
const userId = 'judge-demo-user-001';

const hashedPassword = bcrypt.hashSync(password, 10);

// Delete existing demo user & entries if any to ensure clean seed
db.prepare('DELETE FROM pain_entries WHERE user_id = ?').run(userId);
db.prepare('DELETE FROM users WHERE email = ? OR id = ?').run(email, userId);

// Insert demo user
db.prepare(`
  INSERT INTO users (id, email, password, name, created_at, last_login)
  VALUES (?, ?, ?, ?, datetime('now', '-14 days'), datetime('now'))
`).run(userId, email, hashedPassword, name);

console.log('Demo user created:', { userId, email, password, name });

// 2. Prepare 6 diverse clinical entries across major body spots
const demoEntries = [
  {
    id: uuidv4(),
    device_id: 'judge-demo-device',
    user_id: userId,
    region: 'lower_back',
    region_name: 'Lower Back',
    pain_type: 'dull',
    duration: 'weeks',
    intensity: 8,
    stress_level: 'high',
    trigger_type: 'prolonged_sitting',
    muscles: JSON.stringify(['Erector Spinae', 'Quadratus Lumborum', 'Multifidus']),
    exercises: JSON.stringify([
      {
        title: 'Cat-Cow Gentle Spinal Flow',
        instructions: 'Begin on hands and knees with wrists under shoulders. Inhale gently arching back and looking forward. Exhale rounding spine toward ceiling. 8 smooth cycles.',
        tags: ['lumbar', 'spine', 'mobility'],
      },
      {
        title: 'Pelvic Tilt Decompression',
        instructions: 'Lie on back with knees bent and feet flat. Gently tighten abdominal muscles to press lower back flat against floor. Hold 5 seconds, repeat 10 times.',
        tags: ['core', 'stabilization', 'relief'],
      },
    ]),
    risk_level: 'moderate',
    warning_text: 'Persistent lumbar tension reported. Avoid heavy lifting and prolonged unassisted sitting.',
    disclaimer: 'For educational guidance. Consult a doctor if pain radiates down into legs or feet.',
    created_at_offset: '-2 days',
  },
  {
    id: uuidv4(),
    device_id: 'judge-demo-device',
    user_id: userId,
    region: 'neck',
    region_name: 'Neck',
    pain_type: 'stiffness',
    duration: 'days',
    intensity: 6,
    stress_level: 'medium',
    trigger_type: 'poor_posture',
    muscles: JSON.stringify(['Sternocleidomastoid', 'Upper Trapezius', 'Levator Scapulae']),
    exercises: JSON.stringify([
      {
        title: 'Cervical Retraction & Chin Tucks',
        instructions: 'Sit tall, look straight ahead, and gently glide chin straight backward without tilting head down. Hold 5 seconds. Repeat 8 times.',
        tags: ['cervical', 'posture', 'ergonomics'],
      },
      {
        title: 'Levator Scapulae Gentle Stretch',
        instructions: 'Turn head 45 degrees to the right and gently look down toward armpit. Hold 20 seconds. Repeat on opposite side.',
        tags: ['flexibility', 'neck'],
      },
    ]),
    risk_level: 'moderate',
    warning_text: 'Cervical stiffness from screen fatigue. Take 2-minute posture micro-breaks every 45 minutes.',
    disclaimer: 'If neck pain is accompanied by fever or severe headache, seek immediate medical care.',
    created_at_offset: '-3 days',
  },
  {
    id: uuidv4(),
    device_id: 'judge-demo-device',
    user_id: userId,
    region: 'left_shoulder',
    region_name: 'Left Shoulder',
    pain_type: 'aching',
    duration: 'days',
    intensity: 5,
    stress_level: 'low',
    trigger_type: 'overhead_strain',
    muscles: JSON.stringify(['Deltoid', 'Supraspinatus', 'Infraspinatus']),
    exercises: JSON.stringify([
      {
        title: 'Pendulum Swings',
        instructions: 'Lean forward supporting good arm on a table. Let left arm dangle freely and gently sway in small, smooth clockwise circles for 30 seconds.',
        tags: ['shoulder', 'rehabilitation', 'mobility'],
      },
      {
        title: 'Doorway Pectoral Stretch',
        instructions: 'Stand in open doorway with forearm resting against doorframe at 90 degrees. Step forward gently until feeling mild chest and shoulder stretch. Hold 20 seconds.',
        tags: ['mobility', 'chest'],
      },
    ]),
    risk_level: 'mild',
    warning_text: 'Mild anterior shoulder fatigue. Avoid overhead loading and repetitive reaching.',
    disclaimer: 'For persistent pain lasting more than 2 weeks, request a clinical evaluation.',
    created_at_offset: '-5 days',
  },
  {
    id: uuidv4(),
    device_id: 'judge-demo-device',
    user_id: userId,
    region: 'right_knee',
    region_name: 'Right Knee',
    pain_type: 'dull',
    duration: 'chronic',
    intensity: 4,
    stress_level: 'low',
    trigger_type: 'stair_climbing',
    muscles: JSON.stringify(['Patellar Tendon', 'Vastus Medialis', 'Hamstrings']),
    exercises: JSON.stringify([
      {
        title: 'Straight Leg Raises (Quad Activation)',
        instructions: 'Lie on back, bend left knee, keep right leg straight. Tighten right thigh muscle and slowly lift leg 12 inches. Hold 3 seconds, lower slowly. 10 repetitions.',
        tags: ['knee', 'quadriceps', 'strength'],
      },
      {
        title: 'Seated Hamstring Stretch',
        instructions: 'Sit on edge of chair. Extend right leg forward with heel on floor and toes up. Keep back straight and gently hinge forward at hips. Hold 25 seconds.',
        tags: ['flexibility', 'hamstrings'],
      },
    ]),
    risk_level: 'mild',
    warning_text: 'Mild patellofemoral joint stiffness. Ensure low-impact movement like cycling or walking on flat terrain.',
    disclaimer: 'If knee gives way or locks, contact a sports medicine physician.',
    created_at_offset: '-7 days',
  },
  {
    id: uuidv4(),
    device_id: 'judge-demo-device',
    user_id: userId,
    region: 'upper_back',
    region_name: 'Upper Back',
    pain_type: 'stiffness',
    duration: 'weeks',
    intensity: 6,
    stress_level: 'medium',
    trigger_type: 'desk_work',
    muscles: JSON.stringify(['Rhomboid Major', 'Middle Trapezius', 'Thoracic Paraspinals']),
    exercises: JSON.stringify([
      {
        title: 'Scapular Squeeze & Retraction',
        instructions: 'Sit upright with arms by sides. Squeeze shoulder blades backward and downward together. Hold 5 seconds, relax, repeat 10 times.',
        tags: ['upper back', 'posture', 'scapula'],
      },
      {
        title: 'Thoracic Towel Extension',
        instructions: 'Place rolled towel horizontally under mid-back while lying face up. Support head with hands and gently arch backward across roll for 3-5 gentle breaths.',
        tags: ['thoracic', 'mobility'],
      },
    ]),
    risk_level: 'moderate',
    warning_text: 'Thoracic strain from prolonged desk work. Ensure monitor is at eye level and arms are supported.',
    disclaimer: 'Seek medical evaluation if pain radiates into chest or causes shortness of breath.',
    created_at_offset: '-9 days',
  },
  {
    id: uuidv4(),
    device_id: 'judge-demo-device',
    user_id: userId,
    region: 'left_hip',
    region_name: 'Left Hip',
    pain_type: 'dull',
    duration: 'days',
    intensity: 5,
    stress_level: 'low',
    trigger_type: 'running',
    muscles: JSON.stringify(['Gluteus Medius', 'Piriformis', 'Tensor Fasciae Latae']),
    exercises: JSON.stringify([
      {
        title: 'Seated Figure-4 Hip Stretch',
        instructions: 'Sit on sturdy chair with feet flat. Place left ankle over right knee. Keep spine tall and gently hinge forward at hips until stretching deep glute. Hold 25 seconds.',
        tags: ['hip', 'glutes', 'flexibility'],
      },
      {
        title: 'Side-Lying Clamshells',
        instructions: 'Lie on right side with knees bent at 90 degrees. Keeping heels together, lift left knee upward smoothly without rolling hips backward. 10 repetitions.',
        tags: ['glutes', 'hip stability'],
      },
    ]),
    risk_level: 'mild',
    warning_text: 'Lateral hip tension. Avoid crossing legs while sitting.',
    disclaimer: 'Consult a physician if experiencing sharp groin pain or pain with weight bearing.',
    created_at_offset: '-12 days',
  },
];

const insertEntry = db.prepare(`
  INSERT INTO pain_entries (
    id, device_id, user_id, region, region_name, pain_type, duration, intensity,
    stress_level, trigger_type, muscles, exercises, risk_level,
    warning_text, disclaimer, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, datetime('now', ?)
  )
`);

for (const e of demoEntries) {
  insertEntry.run(
    e.id,
    e.device_id,
    e.user_id,
    e.region,
    e.region_name,
    e.pain_type,
    e.duration,
    e.intensity,
    e.stress_level,
    e.trigger_type,
    e.muscles,
    e.exercises,
    e.risk_level,
    e.warning_text,
    e.disclaimer,
    e.created_at_offset
  );
}

console.log(`Successfully seeded ${demoEntries.length} clinical history entries for demo user.`);
