import Quiz from '../models/Quiz.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isNonEmptyString } from '../utils/validators.js';

const CATEGORY_KEYS = ['cinema', 'geo', 'food', 'sport', 'proverbs'];

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, category, questions } = req.body;

  if (!isNonEmptyString(title, { max: 80 })) {
    return res.status(400).json({ message: 'Title is required (max 80 characters)' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'Description must be text' });
  }
  if (category !== undefined && !CATEGORY_KEYS.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }
  if (!Array.isArray(questions) || questions.length < 3 || questions.length > 30) {
    return res.status(400).json({ message: 'A quiz needs between 3 and 30 questions' });
  }

  for (const q of questions) {
    if (!isNonEmptyString(q?.text, { max: 300 })) {
      return res.status(400).json({ message: 'Every question needs text' });
    }
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => !isNonEmptyString(o, { max: 120 }))) {
      return res.status(400).json({ message: 'Every question needs exactly 4 non-empty options' });
    }
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
      return res.status(400).json({ message: 'Every question needs a valid correctIndex (0-3)' });
    }
  }

  const quiz = await Quiz.create({
    title: title.trim(),
    description: (description ?? '').trim(),
    category,
    createdBy: req.user._id,
    questions: questions.map((q) => ({
      text: q.text.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex
    }))
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
      createdBy: q.createdBy?._id?.toString() ?? null,
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
      createdBy: quiz.createdBy?._id?.toString() ?? null,
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