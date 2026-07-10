/**
 * Selects 2-3 exercises for a region based on pain type.
 * EXTENSIBILITY: Replace with personalized AI recommendation when ready.
 */
import Database from 'better-sqlite3';
import { ExerciseResponse } from '../types';
export declare function selectExercises(regionId: string, painType: string, db: Database.Database): ExerciseResponse[];
//# sourceMappingURL=exerciseSelector.d.ts.map