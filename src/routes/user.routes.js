import { Router } from 'express';
import { 
  getProfile, 
  updateLocale, 
  getMyMatches 
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, getProfile);

// PATCH /api/users/me/locale
router.patch('/me/locale', requireAuth, updateLocale);

// GET /api/users/me/matches
router.get('/me/matches', requireAuth, getMyMatches);

export default router;