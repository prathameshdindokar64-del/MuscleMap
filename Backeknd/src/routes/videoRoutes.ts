/**
 * videoRoutes.ts
 * Defines routes for fetching exercise videos.
 */

import { Router } from 'express';
import { getExerciseVideo } from '../controllers/videoController';

const router = Router();

router.get('/exercises/:id/video', getExerciseVideo);

export default router;
