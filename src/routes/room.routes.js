import { Router } from 'express';
import { createRoom, getRoomByCode, listPublicRooms } from '../controllers/room.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, createRoom);
// Must be registered before '/:code' or Express would try to match
// "public" itself as a room code.
router.get('/public', listPublicRooms);
router.get('/:code', getRoomByCode);

export default router;
