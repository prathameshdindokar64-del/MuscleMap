/**
 * Selects 2-3 exercises for a region based on pain type.
 * EXTENSIBILITY: Replace with personalized AI recommendation when ready.
 */
import Database from 'better-sqlite3';
import { ExerciseResponse, ExerciseRow } from '../types';

export function selectExercises(
  regionId: string,
  painType: string,
  db: Database.Database
): ExerciseResponse[] {
  // 1. Try to find exercises matching both region AND pain_type
  // Using LIKE for simple JSON array matching since pain_types is a stringified array.
  // In a more complex scenario, JSON1 functions could be used.
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

  // 3. Return maximum 3 exercises (already handled by limits, but we slice just in case)
  // Format the output
  return results.slice(0, 3).map(e => ({
    title: e.title,
    instructions: e.instructions,
    tags: JSON.parse(e.tags)
  }));
}
