import { Router } from 'express';
import { getRegionsHandler } from '../controllers/regionController';

const router = Router();

router.get('/regions', async (req, res, next) => {
  try {
    getRegionsHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
