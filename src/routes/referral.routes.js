import { Router } from 'express';
import { getMyReferralStats } from '../controllers/referral.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getMyReferralStats);

export default router;
