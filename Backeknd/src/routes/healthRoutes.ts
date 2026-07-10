import { Router } from 'express';
import { getHealthHandler } from '../controllers/healthController';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    getHealthHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
