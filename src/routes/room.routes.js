import { Router } from 'express';
import { 
  createRoom, 
  getRoomByCode 
} from '../controllers/room.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();


router.post('/', requireAuth, createRoom);

router.get('/code/:code', getRoomByCode);

export default router;