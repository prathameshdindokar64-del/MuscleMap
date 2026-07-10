import { Request, Response } from 'express';
import { getDatabase } from '../db/database';

export const getExercisesHandler = (req: Request, res: Response) => {
  const db = getDatabase();
  const regionId = req.query.regionId as string | undefined;
  const painType = req.query.painType as string | undefined;

  let query = 'SELECT * FROM exercises WHERE 1=1';
  const params: any[] = [];

  if (regionId) {
    query += ' AND region_id = ?';
    params.push(regionId);
  }

  if (painType) {
    query += ' AND pain_types LIKE ?';
    params.push(`%"${painType}"%`);
  }

  const exercises = db.prepare(query).all(...params);
  
  // parse JSON strings before sending
  const parsed = exercises.map((e: any) => ({
    ...e,
    tags: JSON.parse(e.tags),
    pain_types: JSON.parse(e.pain_types)
  }));

  return res.json(parsed);
};
