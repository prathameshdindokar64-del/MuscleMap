import { Router } from 'express';
import { analyzePainHandler } from '../controllers/painController';
import { validateBody } from '../middleware/validateRequest';
import { painSchema } from '../validation/painSchema';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/analyze-pain', optionalAuth, validateBody(painSchema), async (req, res, next) => {
  try {
    await analyzePainHandler(req as any, res);
  } catch (error) {
    next(error);
  }
});

export default router;
