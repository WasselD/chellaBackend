import Room from '../models/Room.js';
import Quiz from '../models/Quiz.js';
import { generateUniqueRoomCode } from '../utils/generateRoomCode.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CATEGORY_KEYS = ['cinema', 'geo', 'food', 'sport', 'proverbs'];

export const createRoom = asyncHandler(async (req, res) => {
  const { category, quizId, mode, questionCount, timePerQuestion, hostId } = req.body;

  if (!hostId) {
    return res.status(400).json({ message: 'hostId is required' });
  }
  if (!quizId && !CATEGORY_KEYS.includes(category)) {
    return res.status(400).json({ message: 'A valid category or a quizId is required' });
  }

  let quiz = null;
  if (quizId) {
    quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  }

  const code = await generateUniqueRoomCode();

  const room = await Room.create({
    code,
    hostId,
    // A custom quiz always plays its full, curated question set rather
    // than a random sample, so questionCount/category come from it.
    category: quiz ? quiz.category : category,
    quizId: quiz?._id ?? null,
    quizTitle: quiz?.title ?? null,
    mode: mode === '1v1' ? '1v1' : 'group',
    questionCount: quiz ? quiz.questions.length : Math.min(Math.max(Number(questionCount) || 10, 5), 25),
    timePerQuestion: Math.min(Math.max(Number(timePerQuestion) || 15, 5), 60),
    status: 'lobby'
  });

  if (quiz) await Quiz.updateOne({ _id: quiz._id }, { $inc: { playCount: 1 } });

  res.status(201).json({ room });
});

// Used by the "join with a code" flow before the client opens a socket,
// so a bad/expired code can show an inline error instead of an empty room.
export const getRoomByCode = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ code: req.params.code });

  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.status === 'ended') return res.status(410).json({ message: 'This room has already ended' });

  res.json({ room });
});
