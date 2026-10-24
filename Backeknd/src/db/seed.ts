/**
 * Seed script for the MuscleMap knowledge base.
 * Populates regions and exercises tables. Safe to run multiple times.
 */
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase } from './database';
import { runSchema } from './schema';

const REGIONS = [
  { id: 'neck', name: 'Neck', description: 'Upper cervical and neck muscle region' },
  { id: 'left_shoulder', name: 'Left Shoulder', description: 'Anterior, lateral, and posterior shoulder muscles' },
  { id: 'right_shoulder', name: 'Right Shoulder', description: 'Anterior, lateral, and posterior shoulder muscles' },
  { id: 'chest', name: 'Chest', description: 'Pectoral and anterior thoracic muscles' },
  { id: 'upper_back', name: 'Upper Back', description: 'Trapezius, rhomboids, and upper spinal muscles' },
  { id: 'lower_back', name: 'Lower Back', description: 'Lumbar spinal and deep stabilizer muscles' },
  { id: 'abdomen', name: 'Abdomen', description: 'Core and abdominal wall muscles' },
  { id: 'left_hip', name: 'Left Hip', description: 'Gluteal and deep hip rotator muscles' },
  { id: 'right_hip', name: 'Right Hip', description: 'Gluteal and deep hip rotator muscles' },
  { id: 'left_thigh', name: 'Left Thigh', description: 'Quadriceps, hamstrings, and adductor muscles' },
  { id: 'right_thigh', name: 'Right Thigh', description: 'Quadriceps, hamstrings, and adductor muscles' },
  { id: 'left_knee', name: 'Left Knee', description: 'Patellar, IT band, and popliteus structures' },
  { id: 'right_knee', name: 'Right Knee', description: 'Patellar, IT band, and popliteus structures' },
  { id: 'left_calf', name: 'Left Calf', description: 'Gastrocnemius, soleus, and tibialis muscles' },
  { id: 'right_calf', name: 'Right Calf', description: 'Gastrocnemius, soleus, and tibialis muscles' },
  { id: 'left_ankle', name: 'Left Ankle', description: 'Achilles, peroneal, and plantar structures' },
  { id: 'right_ankle', name: 'Right Ankle', description: 'Achilles, peroneal, and plantar structures' },
  { id: 'left_wrist', name: 'Left Wrist', description: 'Forearm flexor and extensor muscles' },
  { id: 'right_wrist', name: 'Right Wrist', description: 'Forearm flexor and extensor muscles' },
];

interface ExerciseSeed {
  region_id: string;
  title: string;
  instructions: string;
  tags: string[];
  pain_types: string[];
  difficulty: string;
  duration_min: number;
}

const EXERCISES: ExerciseSeed[] = [
  // ── Neck ──
  { region_id: 'neck', title: 'Chin Tuck', instructions: 'Sit or stand with good posture. Gently draw your chin straight back as if making a double chin. Hold for 5 seconds, then release. Repeat 10 times for 2 sets.', tags: ['Stretch','Beginner','Posture'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'neck', title: 'Neck Side Stretch', instructions: 'Sit tall and gently tilt your head toward your right shoulder until you feel a stretch on the left side. Hold for 20 seconds, then switch sides. Repeat 3 times each side.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'neck', title: 'Levator Scapulae Stretch', instructions: 'Sit tall. Turn your head 45 degrees to the right. Gently tilt your chin down toward your armpit until you feel a stretch in the back of your neck. Hold 20 seconds, switch sides. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','sharp'], difficulty: 'beginner', duration_min: 5 },
  // ── Left Shoulder ──
  { region_id: 'left_shoulder', title: 'Pendulum Swing', instructions: 'Lean forward with your right hand on a table. Let your left arm hang down. Gently swing it in small circles, 10 clockwise and 10 counterclockwise. Do 2 sets.', tags: ['Mobility','Beginner','Relief'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_shoulder', title: 'Cross-Body Stretch', instructions: 'Bring your left arm across your chest. Use your right hand to gently pull it closer. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_shoulder', title: 'Wall Slide', instructions: 'Stand with your back against a wall. Place your arms against the wall in a goal-post position. Slowly slide your arms up and down. Do 10 reps for 2 sets.', tags: ['Strengthening','Beginner','Posture'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Right Shoulder ──
  { region_id: 'right_shoulder', title: 'Pendulum Swing', instructions: 'Lean forward with your left hand on a table. Let your right arm hang down. Gently swing it in small circles, 10 clockwise and 10 counterclockwise. Do 2 sets.', tags: ['Mobility','Beginner','Relief'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_shoulder', title: 'Cross-Body Stretch', instructions: 'Bring your right arm across your chest. Use your left hand to gently pull it closer. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_shoulder', title: 'Wall Slide', instructions: 'Stand with your back against a wall. Place your arms in a goal-post position. Slowly slide your arms up and down. Do 10 reps for 2 sets.', tags: ['Strengthening','Beginner','Posture'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Chest ──
  { region_id: 'chest', title: 'Doorway Pec Stretch', instructions: 'Stand in a doorway with your arms on the frame at shoulder height. Step forward gently until you feel a stretch across your chest. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'chest', title: 'Deep Breathing Expansion', instructions: 'Sit upright with hands on your ribcage. Inhale deeply through your nose for 4 seconds, expanding your chest. Exhale slowly for 6 seconds. Repeat 10 times.', tags: ['Breathing','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'chest', title: 'Foam Roller Chest Opener', instructions: 'Lie on a foam roller along your spine with knees bent. Let your arms fall open to the sides. Breathe deeply and hold for 60 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Upper Back ──
  { region_id: 'upper_back', title: 'Thoracic Extension', instructions: 'Sit in a chair. Clasp your hands behind your head. Gently arch your upper back over the chair back. Hold 5 seconds, return. Repeat 10 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'upper_back', title: 'Scapular Squeeze', instructions: 'Sit or stand tall. Squeeze your shoulder blades together as if holding a pencil between them. Hold 5 seconds, release. Repeat 15 times.', tags: ['Strengthening','Beginner','Posture'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'upper_back', title: 'Thread the Needle', instructions: 'Start on hands and knees. Slide your right arm under your body, rotating your upper back. Hold 15 seconds. Return and switch sides. Repeat 5 times each.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness','sharp'], difficulty: 'beginner', duration_min: 5 },
  // ── Lower Back ──
  { region_id: 'lower_back', title: 'Cat-Cow Stretch', instructions: 'Start on hands and knees. Breathe in and let your belly drop while lifting head and tailbone. Breathe out and round your back toward the ceiling. Repeat 10 times for 2 sets.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  { region_id: 'lower_back', title: 'Knee-to-Chest Stretch', instructions: 'Lie flat on your back. Bend both knees. Gently pull both knees toward your chest. Hold 20-30 seconds. Release slowly. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','sharp'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'lower_back', title: 'Pelvic Tilt', instructions: 'Lie on your back with knees bent. Flatten your lower back against the floor by tightening your abdominal muscles. Hold 5 seconds, release. Repeat 10-15 times.', tags: ['Strengthening','Beginner','Core'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 5 },
  { region_id: 'lower_back', title: 'Tennis Ball Self-Massage', instructions: 'Place a tennis ball on the floor. Lower your lower back onto it on a tender area. Support weight on your feet. Hold 30-60 seconds per spot. Move to 2-3 spots.', tags: ['Self-massage','Trigger point','Beginner'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Abdomen ──
  { region_id: 'abdomen', title: 'Diaphragmatic Breathing', instructions: 'Lie on your back with knees bent. Place one hand on your chest, one on your belly. Breathe in through your nose so your belly rises. Exhale slowly. Repeat 10 times.', tags: ['Breathing','Beginner','Core'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'abdomen', title: 'Gentle Abdominal Stretch', instructions: 'Lie face down. Place hands under shoulders. Gently press up, lifting your chest while keeping hips on the floor. Hold 15 seconds. Repeat 5 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'abdomen', title: 'Supine Twist', instructions: 'Lie on your back. Bend your knees and let them fall gently to one side. Keep shoulders flat. Hold 20 seconds per side. Repeat 3 times each.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Left Hip ──
  { region_id: 'left_hip', title: 'Figure-4 Stretch', instructions: 'Lie on your back. Cross your left ankle over your right knee. Pull your right thigh toward you. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'left_hip', title: 'Hip Flexor Lunge Stretch', instructions: 'Kneel on your left knee with your right foot forward. Push your hips forward gently until you feel a stretch. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'left_hip', title: 'Clamshell Exercise', instructions: 'Lie on your right side with knees bent. Keep feet together and lift your left knee like a clamshell opening. Hold 3 seconds. Do 15 reps for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Right Hip ──
  { region_id: 'right_hip', title: 'Figure-4 Stretch', instructions: 'Lie on your back. Cross your right ankle over your left knee. Pull your left thigh toward you. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'right_hip', title: 'Hip Flexor Lunge Stretch', instructions: 'Kneel on your right knee with left foot forward. Push hips forward gently. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'right_hip', title: 'Clamshell Exercise', instructions: 'Lie on your left side with knees bent. Keep feet together and lift your right knee. Hold 3 seconds. Do 15 reps for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Left Thigh ──
  { region_id: 'left_thigh', title: 'Standing Quad Stretch', instructions: 'Stand on your right leg. Bend your left knee and grab your left foot behind you. Pull gently toward your glute. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_thigh', title: 'Seated Hamstring Stretch', instructions: 'Sit on the floor with your left leg extended. Reach toward your left toes. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'left_thigh', title: 'Foam Roller IT Band', instructions: 'Lie on your left side with a foam roller under your outer thigh. Roll slowly from hip to knee. Spend 30 seconds on tender spots. Do 2 passes.', tags: ['Self-massage','Intermediate','Relief'], pain_types: ['dull','stiffness','sharp'], difficulty: 'intermediate', duration_min: 5 },
  // ── Right Thigh ──
  { region_id: 'right_thigh', title: 'Standing Quad Stretch', instructions: 'Stand on your left leg. Bend your right knee and grab your right foot behind you. Pull gently. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_thigh', title: 'Seated Hamstring Stretch', instructions: 'Sit with your right leg extended. Reach toward your right toes. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'right_thigh', title: 'Foam Roller IT Band', instructions: 'Lie on your right side with a foam roller under your outer thigh. Roll from hip to knee. Spend 30 seconds on tender spots. Do 2 passes.', tags: ['Self-massage','Intermediate','Relief'], pain_types: ['dull','stiffness','sharp'], difficulty: 'intermediate', duration_min: 5 },
  // ── Left Knee ──
  { region_id: 'left_knee', title: 'Straight Leg Raise', instructions: 'Lie on your back. Keep your left leg straight and slowly raise it about 12 inches. Hold 5 seconds. Lower slowly. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  { region_id: 'left_knee', title: 'Wall Sit', instructions: 'Stand with your back against a wall. Slide down until your knees are at about 45 degrees. Hold 15-30 seconds. Repeat 5 times.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  { region_id: 'left_knee', title: 'Hamstring Curl', instructions: 'Stand holding a chair. Bend your left knee bringing your heel toward your glute. Hold 3 seconds. Lower slowly. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 5 },
  // ── Right Knee ──
  { region_id: 'right_knee', title: 'Straight Leg Raise', instructions: 'Lie on your back. Keep your right leg straight and slowly raise it about 12 inches. Hold 5 seconds. Lower slowly. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  { region_id: 'right_knee', title: 'Wall Sit', instructions: 'Stand with your back against a wall. Slide down until knees are at 45 degrees. Hold 15-30 seconds. Repeat 5 times.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  { region_id: 'right_knee', title: 'Hamstring Curl', instructions: 'Stand holding a chair. Bend your right knee bringing heel toward glute. Hold 3 seconds. Lower slowly. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 5 },
  // ── Left Calf ──
  { region_id: 'left_calf', title: 'Standing Calf Stretch', instructions: 'Face a wall. Step your left foot back. Keep left heel on the floor and lean forward. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_calf', title: 'Soleus Stretch', instructions: 'Same as calf stretch but bend your left knee slightly while keeping heel down. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_calf', title: 'Calf Raise', instructions: 'Stand on the edge of a step with heels hanging off. Rise up on your toes, then lower slowly. Do 15 reps for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Right Calf ──
  { region_id: 'right_calf', title: 'Standing Calf Stretch', instructions: 'Face a wall. Step your right foot back. Keep right heel on the floor and lean forward. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Mobility'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_calf', title: 'Soleus Stretch', instructions: 'Same as calf stretch but bend your right knee slightly while keeping heel down. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_calf', title: 'Calf Raise', instructions: 'Stand on a step edge with heels off. Rise up on toes, then lower slowly. Do 15 reps for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 5 },
  // ── Left Ankle ──
  { region_id: 'left_ankle', title: 'Ankle Circles', instructions: 'Sit with your left foot off the floor. Slowly rotate your ankle in circles, 10 clockwise and 10 counterclockwise. Do 2 sets.', tags: ['Mobility','Beginner','Relief'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_ankle', title: 'Towel Scrunches', instructions: 'Sit with your left foot on a towel. Use your toes to scrunch the towel toward you. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'left_ankle', title: 'Resistance Band Eversion', instructions: 'Sit with a resistance band around your left foot anchored to your right. Push your left foot outward against the band. Do 15 reps for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 5 },
  // ── Right Ankle ──
  { region_id: 'right_ankle', title: 'Ankle Circles', instructions: 'Sit with your right foot off the floor. Rotate your ankle in circles, 10 each direction. Do 2 sets.', tags: ['Mobility','Beginner','Relief'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_ankle', title: 'Towel Scrunches', instructions: 'Sit with right foot on a towel. Scrunch the towel toward you with your toes. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  { region_id: 'right_ankle', title: 'Resistance Band Eversion', instructions: 'Sit with a band around your right foot. Push foot outward against band. Do 15 reps for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 5 },
  // ── Left Wrist ──
  { region_id: 'left_wrist', title: 'Wrist Flexor Stretch', instructions: 'Extend your left arm with palm up. Use your right hand to gently pull fingers back. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_wrist', title: 'Wrist Circles', instructions: 'Make a fist with your left hand. Slowly rotate your wrist in circles, 10 each direction. Do 2 sets.', tags: ['Mobility','Beginner','Relief'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'left_wrist', title: 'Grip Strengthener', instructions: 'Squeeze a soft ball or rolled towel with your left hand. Hold 5 seconds, release. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
  // ── Right Wrist ──
  { region_id: 'right_wrist', title: 'Wrist Flexor Stretch', instructions: 'Extend your right arm palm up. Use left hand to pull fingers back gently. Hold 20 seconds. Repeat 3 times.', tags: ['Stretch','Beginner','Relief'], pain_types: ['dull','stiffness','burning'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_wrist', title: 'Wrist Circles', instructions: 'Make a fist with your right hand. Rotate your wrist in circles, 10 each direction. Do 2 sets.', tags: ['Mobility','Beginner','Relief'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 3 },
  { region_id: 'right_wrist', title: 'Grip Strengthener', instructions: 'Squeeze a soft ball with your right hand. Hold 5 seconds, release. Repeat 10 times for 2 sets.', tags: ['Strengthening','Beginner','Stability'], pain_types: ['dull','stiffness'], difficulty: 'beginner', duration_min: 4 },
];

// ─── v2: Acupressure Points for the DB table ───────────────────────
interface AcupressureSeed {
  id: string;
  region_id: string;
  name: string;
  location: string;
  how_to: string;
}

const ACUPRESSURE_SEEDS: AcupressureSeed[] = [
  // Neck
  { id: 'acu-neck-gb21', region_id: 'neck', name: 'Jianjing (GB21)', location: 'Midpoint between the base of the neck and the top of the shoulder.', how_to: 'Press firmly downward with your thumb for 30–60 seconds while breathing slowly. Repeat on both sides.' },
  { id: 'acu-neck-bl10', region_id: 'neck', name: 'Tianzhu (BL10)', location: 'About one finger-width below the base of the skull, on either side of the spine.', how_to: 'Press inward and slightly upward with both thumbs simultaneously for 60 seconds. Breathe deeply.' },
  // Shoulders
  { id: 'acu-lshoulder-li15', region_id: 'left_shoulder', name: 'Jianyu (LI15)', location: 'Depression at the front of the shoulder joint when arm is raised sideways.', how_to: 'Press gently into the hollow with your thumb for 30 seconds. Release and repeat 3 times.' },
  { id: 'acu-rshoulder-li15', region_id: 'right_shoulder', name: 'Jianyu (LI15)', location: 'Depression at the front of the shoulder joint when arm is raised sideways.', how_to: 'Press gently into the hollow with your thumb for 30 seconds. Release and repeat 3 times.' },
  // Upper Back
  { id: 'acu-uback-bl13', region_id: 'upper_back', name: 'Feishu (BL13)', location: 'About two finger-widths on either side of the spine at shoulder blade level.', how_to: 'Apply gentle pressure with both thumbs simultaneously for 60 seconds while breathing deeply.' },
  { id: 'acu-uback-si11', region_id: 'upper_back', name: 'Tianzong (SI11)', location: 'Center of the shoulder blade in the depression.', how_to: 'Press firmly with a tennis ball against a wall for 30–60 seconds. Move gently to find tender spots.' },
  // Lower Back
  { id: 'acu-lback-bl23', region_id: 'lower_back', name: 'Shenshu (BL23)', location: 'About two finger-widths on either side of the spine at waist level.', how_to: 'Place thumbs on both sides of the spine at waist height. Press firmly for 60 seconds. Repeat twice.' },
  { id: 'acu-lback-bl40', region_id: 'lower_back', name: 'Weizhong (BL40)', location: 'Center of the crease behind the knee.', how_to: 'Press firmly into the center of the back of the knee for 30 seconds per side. Great for acute lower back spasm.' },
  { id: 'acu-lback-du4', region_id: 'lower_back', name: 'Mingmen (DU4)', location: 'On the spine directly behind the belly button.', how_to: 'Press gently with your thumb for 30–60 seconds while standing or seated. Supports lower back warmth.' },
  // Knees
  { id: 'acu-lknee-st36', region_id: 'left_knee', name: 'Zusanli (ST36)', location: 'About four finger-widths below the kneecap, one finger-width to the outer side of the shinbone.', how_to: 'Press with your thumb for 30–60 seconds. A feeling of mild aching is normal. Repeat on both sides.' },
  { id: 'acu-rknee-st36', region_id: 'right_knee', name: 'Zusanli (ST36)', location: 'About four finger-widths below the kneecap, one finger-width to the outer side of the shinbone.', how_to: 'Press with your thumb for 30–60 seconds. A feeling of mild aching is normal. Repeat on both sides.' },
  // Hips
  { id: 'acu-lhip-gb30', region_id: 'left_hip', name: 'Huantiao (GB30)', location: 'In the center of the buttock, roughly one-third of the way from the hip bone to the tailbone.', how_to: 'Apply deep firm pressure with a tennis ball (lie on it) for 60 seconds. Breathe through any tenderness.' },
  { id: 'acu-rhip-gb30', region_id: 'right_hip', name: 'Huantiao (GB30)', location: 'In the center of the buttock, roughly one-third of the way from the hip bone to the tailbone.', how_to: 'Apply deep firm pressure with a tennis ball (lie on it) for 60 seconds. Breathe through any tenderness.' },
  // Chest
  { id: 'acu-chest-cv17', region_id: 'chest', name: 'Shanzhong (CV17)', location: 'Center of the breastbone, at heart level.', how_to: 'Press gently on the sternum with your finger for 60 seconds while breathing slowly and deeply.' },
  // Wrists
  { id: 'acu-lwrist-pc6', region_id: 'left_wrist', name: 'Neiguan (PC6)', location: 'About three finger-widths above the wrist crease on the inner forearm, between the two tendons.', how_to: 'Press with your thumb for 30 seconds. Helps with wrist pain and general tension. Repeat 3 times.' },
  { id: 'acu-rwrist-pc6', region_id: 'right_wrist', name: 'Neiguan (PC6)', location: 'About three finger-widths above the wrist crease on the inner forearm, between the two tendons.', how_to: 'Press with your thumb for 30 seconds. Helps with wrist pain and general tension. Repeat 3 times.' },
];

function seed(): void {
  const db = initializeDatabase();
  runSchema(db);

  // Check if base data already exists
  const count = db.prepare('SELECT COUNT(*) as count FROM regions').get() as { count: number };
  if (count.count > 0) {
    console.log('Seed data already exists. Checking acupressure...');
  } else {
    const insertRegion = db.prepare('INSERT INTO regions (id, name, description) VALUES (?, ?, ?)');
    const insertExercise = db.prepare('INSERT INTO exercises (id, region_id, title, instructions, tags, pain_types, difficulty, duration_min) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    const seedBase = db.transaction(() => {
      for (const r of REGIONS) {
        insertRegion.run(r.id, r.name, r.description);
      }
      for (const e of EXERCISES) {
        insertExercise.run(uuidv4(), e.region_id, e.title, e.instructions, JSON.stringify(e.tags), JSON.stringify(e.pain_types), e.difficulty, e.duration_min);
      }
    });

    seedBase();
    console.log(`Seeded ${REGIONS.length} regions and ${EXERCISES.length} exercises.`);
  }

  // v2: Seed acupressure points (safe to re-run with INSERT OR IGNORE)
  const insertAcupressure = db.prepare(
    'INSERT OR IGNORE INTO acupressure_points (id, region_id, name, location, how_to) VALUES (?, ?, ?, ?, ?)'
  );
  const seedAcupressure = db.transaction(() => {
    for (const ap of ACUPRESSURE_SEEDS) {
      insertAcupressure.run(ap.id, ap.region_id, ap.name, ap.location, ap.how_to);
    }
  });
  seedAcupressure();
  console.log(`Seeded ${ACUPRESSURE_SEEDS.length} acupressure points (INSERT OR IGNORE).`);
}

seed();

