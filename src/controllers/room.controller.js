import Room from '../models/Room.js';
import Quiz from '../models/Quiz.js';
import { generateUniqueRoomCode } from '../utils/generateRoomCode.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isValidRoomCode } from '../utils/validators.js';

const CATEGORY_KEYS = ['cinema', 'geo', 'food', 'sport', 'proverbs'];

export const createRoom = asyncHandler(async (req, res) => {
  const { category, quizId, mode, questionCount, timePerQuestion, visibility } = req.body;

  // The host is always the authenticated caller (req.user, set by
  // requireAuth) — never trust a hostId supplied in the request body,
  // or any player could create a room and list someone else as host.
  const hostId = req.user._id;

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
    visibility: visibility === 'public' ? 'public' : 'private',
    questionCount: quiz ? quiz.questions.length : Math.min(Math.max(Number(questionCount) || 10, 5), 25),
    timePerQuestion: Math.min(Math.max(Number(timePerQuestion) || 15, 5), 60),
    status: 'lobby'
  });

  if (quiz) await Quiz.updateOne({ _id: quiz._id }, { $inc: { playCount: 1 } });

  res.status(201).json({ room });
});

// Public browse list — open, joinable-without-a-code rooms only. Kept
// deliberately minimal (no player identities) since it's unauthenticated.
export const listPublicRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ visibility: 'public', status: 'lobby' })
    .sort({ createdAt: -1 })
    .limit(30)
    .select('code category quizTitle mode questionCount players createdAt');

  res.json({
    rooms: rooms.map((r) => ({
      code: r.code,
      category: r.category,
      quizTitle: r.quizTitle,
      mode: r.mode,
      questionCount: r.questionCount,
      playerCount: r.players.length,
      createdAt: r.createdAt
    }))
  });
});

// Used by the "join with a code" flow before the client opens a socket,
// so a bad/expired code can show an inline error instead of an empty room.
export const getRoomByCode = asyncHandler(async (req, res) => {
  if (!isValidRoomCode(req.params.code)) {
    return res.status(400).json({ message: 'Room codes are 6 digits' });
  }

  const room = await Room.findOne({ code: req.params.code });

  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.status === 'ended') return res.status(410).json({ message: 'This room has already ended' });

  res.json({ room });
});
