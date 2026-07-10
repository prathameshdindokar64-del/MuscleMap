import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validateRequest';
import { registerSchema, loginSchema } from '../validation/authSchema';

const router = Router();

// POST /api/auth/register
router.post('/auth/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    await register(req, res);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/auth/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/profile (protected)
router.get('/auth/profile', requireAuth, (req, res, next) => {
  try {
    getProfile(req as any, res);
  } catch (error) {
    next(error);
  }
});

export default router;
