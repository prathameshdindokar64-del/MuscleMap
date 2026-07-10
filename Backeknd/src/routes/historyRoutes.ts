import { Router } from 'express';
import { getHistoryHandler } from '../controllers/historyController';
import { validateQuery } from '../middleware/validateRequest';
import { historySchema } from '../validation/historySchema';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/history', optionalAuth, validateQuery(historySchema), async (req, res, next) => {
  try {
    getHistoryHandler(req as any, res);
  } catch (error) {
    next(error);
  }
});

export default router;
