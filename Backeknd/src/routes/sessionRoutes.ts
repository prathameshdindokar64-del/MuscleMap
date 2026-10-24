/**
 * sessionRoutes.ts
 * Defines routes for viewing and deleting full sessions.
 */

import { Router } from 'express';
import { getSessionById, deleteSessionById } from '../controllers/sessionController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/sessions/:id', optionalAuth, getSessionById);
router.delete('/sessions/:id', optionalAuth, deleteSessionById);

export default router;
