import { Router } from 'express';
import { 
  getProfile, 
  getUserMatchHistory 
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/users/me - Current user profile
router.get('/me', requireAuth, getProfile);

// GET /api/users/me/matches - Current user match history records
router.get('/me/matches', requireAuth, getUserMatchHistory);

export default router;