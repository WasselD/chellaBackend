import { Router } from 'express';
import { 
  createRoom, 
  getRoomByCode 
} from '../controllers/room.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/rooms - Create a room
router.post('/', requireAuth, createRoom);

// GET /api/rooms/:code - Direct room lookup by code for frontend joining
router.get('/:code', getRoomByCode);

// GET /api/rooms/code/:code - Alternative route prefix for room code checks
router.get('/code/:code', getRoomByCode);

export default router;