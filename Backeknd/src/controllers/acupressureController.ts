/**
 * acupressureController.ts
 * Handles GET /api/regions/:id/acupressure
 * Returns beginner-safe acupressure points for the requested body region.
 */

import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { AcupressureRow, AcupressureResponse } from '../types';
import { ACUPRESSURE_POINTS } from '../constants/acupressure';

export const getAcupressureByRegion = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const db = getDatabase();

  try {
    const rows = db.prepare(
      'SELECT name, location, how_to FROM acupressure_points WHERE region_id = ?'
    ).all(id) as AcupressureRow[];

    if (rows && rows.length > 0) {
      const response: AcupressureResponse[] = rows.map((r) => ({
        name: r.name,
        location: r.location,
        howTo: r.how_to,
      }));
      return res.json(response);
    }
  } catch {
    // If table query fails, fall back to constants
  }

  // Fallback to constants if DB table is empty or missing
  const fallback = ACUPRESSURE_POINTS[id as string];
  if (!fallback || fallback.length === 0) {
    return res.json([]);
  }

  const response: AcupressureResponse[] = fallback.map((p) => ({
    name: p.name,
    location: p.description,
    howTo: p.technique,
  }));

  return res.json(response);
};
