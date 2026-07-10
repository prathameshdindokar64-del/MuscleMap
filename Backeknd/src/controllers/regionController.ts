import { Request, Response } from 'express';
import { getDatabase } from '../db/database';

export const getRegionsHandler = (req: Request, res: Response) => {
  const db = getDatabase();
  const regions = db.prepare('SELECT id, name, description FROM regions ORDER BY name').all();
  return res.json(regions);
};
