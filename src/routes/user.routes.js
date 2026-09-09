import { Router } from 'express';
import { 
  getProfile, 
  updateLocale, 
  getMyMatches 
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/users/me - Get current user profile
router.get('/me', requireAuth, getProfile);

// PATCH /api/users/me/locale - Update language preference
router.patch('/me/locale', requireAuth, updateLocale);

// GET /api/users/me/matches - Get match history for dashboard
router.get('/me/matches', requireAuth, getMyMatches);

export default router;