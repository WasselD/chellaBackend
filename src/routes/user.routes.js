import { Router } from 'express';
import { getProfile, updateLocale, getMyMatches } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me/locale', requireAuth, updateLocale);
router.get('/me/matches', requireAuth, getMyMatches);

export default router;
