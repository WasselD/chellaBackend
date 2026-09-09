import { Router } from 'express';
import { createQuiz, listQuizzes, getQuiz, deleteQuiz } from '../controllers/quiz.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', listQuizzes);
router.post('/', requireAuth, createQuiz);
router.get('/:id', getQuiz);
router.delete('/:id', requireAuth, deleteQuiz);

export default router;
