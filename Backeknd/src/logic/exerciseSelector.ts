/**
 * exerciseSelector.ts
 * Selects 2-3 exercises for a region based on pain type.
 * v2: Returns id, videoSearchQuery, and guidedModeAvailable alongside the original fields.
 * EXTENSIBILITY: Replace with personalized AI recommendation when ready.
 */
import Database from 'better-sqlite3';
import { ExerciseResponse, ExerciseRow } from '../types';

/** Prefix added to exercise titles to form a YouTube-friendly search query */
const VIDEO_QUERY_SUFFIX = 'how to physiotherapy beginner';

/** Exercises that require lying down and can't use webcam-based guided mode */
const NON_GUIDED_EXERCISES = [
  'Cat-Cow Stretch',
  'Knee-to-Chest Stretch',
  'Pelvic Tilt',
  'Tennis Ball Self-Massage',
  'Foam Roller Chest Opener',
  'Foam Roller IT Band',
  'Supine Twist',
  'Gentle Abdominal Stretch',
  'Diaphragmatic Breathing',
] as const;

function isGuidedAvailable(title: string): boolean {
  return !NON_GUIDED_EXERCISES.some(
    (noGuide) => title.toLowerCase() === noGuide.toLowerCase()
  );
}

function toExerciseResponse(row: ExerciseRow): ExerciseResponse {
  return {
    id: row.id,
    title: row.title,
    instructions: row.instructions,
    tags: JSON.parse(row.tags),
    videoSearchQuery: `${row.title} ${VIDEO_QUERY_SUFFIX}`,
    guidedModeAvailable: row.guided_mode_available === 1
      ? true
      : isGuidedAvailable(row.title),
  };
}

export function selectExercises(
  regionId: string,
  painType: string,
  db: Database.Database
): ExerciseResponse[] {
  // 1. Try to find exercises matching both region AND pain_type
  // Using LIKE for simple JSON array matching since pain_types is a stringified array.
  const painMatchQuery = `
    SELECT * FROM exercises 
    WHERE region_id = ? 
    AND pain_types LIKE ?
    LIMIT 3
  `;
  const matchingPainStr = `%"${painType}"%`;
  const matchingExercises = db.prepare(painMatchQuery).all(regionId, matchingPainStr) as ExerciseRow[];

  let results = [...matchingExercises];

  // 2. If fewer than 2 found, fill remaining from all exercises for the region
  if (results.length < 2) {
    const needed = 3 - results.length;
    const existingIds = results.map(e => e.id);
    const placeholders = existingIds.length > 0 ? existingIds.map(() => '?').join(',') : "''";
    
    let fallbackQuery = `
      SELECT * FROM exercises 
      WHERE region_id = ?
    `;
    
    let fallbackParams: any[] = [regionId];
    
    if (existingIds.length > 0) {
      fallbackQuery += ` AND id NOT IN (${placeholders})`;
      fallbackParams.push(...existingIds);
    }
    
    fallbackQuery += ` LIMIT ?`;
    fallbackParams.push(needed);

    const fallbackExercises = db.prepare(fallbackQuery).all(...fallbackParams) as ExerciseRow[];
    results = results.concat(fallbackExercises);
  }

  // 3. Return maximum 3 exercises formatted with v2 fields
  return results.slice(0, 3).map(toExerciseResponse);
}
