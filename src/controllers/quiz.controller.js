import Quiz from '../models/Quiz.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, category, questions } = req.body;

  if (!title || !Array.isArray(questions) || questions.length < 3) {
    return res.status(400).json({ message: 'A title and at least 3 questions are required' });
  }

  for (const q of questions) {
    if (!q.text || !Array.isArray(q.options) || q.options.length !== 4) {
      return res.status(400).json({ message: 'Every question needs text and exactly 4 options' });
    }
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
      return res.status(400).json({ message: 'Every question needs a valid correctIndex (0-3)' });
    }
  }

  const quiz = await Quiz.create({
    title,
    description,
    category,
    createdBy: req.user._id,
    questions
  });

  res.status(201).json({ quiz: quiz.toSummaryJSON() });
});

// Public browse list — newest first, summary shape only (no answers
// leaked to players who haven't played it yet).
export const listQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('createdBy', 'username');

  res.json({
    quizzes: quizzes.map((q) => ({
      ...q.toSummaryJSON(),
      creatorUsername: q.createdBy?.username ?? 'Chella player'
    }))
  });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  res.json({
    quiz: {
      ...quiz.toSummaryJSON(),
      creatorUsername: quiz.createdBy?.username ?? 'Chella player'
    }
  });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!quiz.createdBy.equals(req.user._id)) {
    return res.status(403).json({ message: 'Only the creator can delete this quiz' });
  }

  await quiz.deleteOne();
  res.json({ ok: true });
});
