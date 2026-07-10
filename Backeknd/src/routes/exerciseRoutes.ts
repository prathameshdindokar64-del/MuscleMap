import { Router } from 'express';
import { getExercisesHandler } from '../controllers/exerciseController';

const router = Router();

router.get('/exercises', async (req, res, next) => {
  try {
    getExercisesHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
