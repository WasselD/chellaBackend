import { Router } from 'express';
import { getProfile, updateLocale } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me/locale', requireAuth, updateLocale);

export default router;
