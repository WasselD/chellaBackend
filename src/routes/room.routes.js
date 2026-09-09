import { Router } from 'express';
import { 
  createRoom, 
  getRooms 
} from '../controllers/room.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getRooms);


router.post('/', requireAuth, createRoom);

export default router;