/**
 * acupressureRoutes.ts
 * Defines routes for fetching acupressure points.
 */

import { Router } from 'express';
import { getAcupressureByRegion } from '../controllers/acupressureController';

const router = Router();

router.get('/regions/:id/acupressure', getAcupressureByRegion);

export default router;
