import Room from '../models/Room.js';
import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import MatchHistory from '../models/MatchHistory.js';
import { spendCoins, addCoins, HINT_COSTS, InsufficientCoinsError } from '../services/coinService.js';

const activeRooms = new Map();

const MATCH_REWARD_WINNER = 30;
const MATCH_REWARD_PARTICIPANT = 10;
const REVEAL_TO_NEXT_QUESTION_DELAY_MS = 3000;

function getUserId(user) {
  if (!user) return null;
  return user.id ? user.id.toString() : user._id ? user._id.toString() : null;
}

function toPublicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    category: room.category,
    quizTitle: room.quizTitle,
    mode: room.mode,
    status: room.status,
    questionCount: room.questionCount,
    timePerQuestion: room.timePerQuestion
  };
}

function playersArray(room) {
  return Array.from(room.players.values()).map((p) => ({
    id: p.id,
    username: p.username,
    score: p.score,
    connected: p.connected
  }));
}

async function syncPlayersToDB(room) {
  try {
    await Room.updateOne(
      { code: room.code },
      {
        players: playersArray(room).map((p) => ({ userId: p.id, username: p.username, score: p.score })),
        status: room.status,
        ...(room.status === 'ended' ? { endedAt: new Date() } : {})
      }
    );
  } catch (err) {
    console.error(`[gameEngine] failed to sync room ${room.code} to DB:`, err.message);
  }
}

async function loadQuestionsForRoom(dbRoom) {
  if (dbRoom.quizId) {
    const quiz = await Quiz.findById(dbRoom.quizId);
    if (!quiz) return [];

    return quiz.questions.map((q, i) => ({
      id: `${quiz._id.toString()}-${i}`,
      text: { en: q.text, ar: q.text },
      options: q.options.map((o) => ({ en: o, ar: o })),
      correctIndex: q.correctIndex
    }));
  }

  const sampled = await Question.aggregate([
    { $match: { category: dbRoom.category } },
    { $sample: { size: dbRoom.questionCount } }
  ]);

  return sampled.map((q) => ({
    id: q._id.toString(),
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex
  }));
}

async function getOrLoadRoom(code) {
  if (activeRooms.has(code)) return activeRooms.get(code);

  const dbRoom = await Room.findOne({ code });
  if (!dbRoom) return null;

  const room = {
    code: dbRoom.code,
    hostId: dbRoom.hostId.toString(),
    category: dbRoom.category,
    quizId: dbRoom.quizId ? dbRoom.quizId.toString() : null,
    quizTitle: dbRoom.quizTitle,
    mode: dbRoom.mode,
    questionCount: dbRoom.questionCount,
    timePerQuestion: dbRoom.timePerQuestion,
    status: dbRoom.status,
    players: new Map(
      (dbRoom.players || []).map((p) => [
        p.userId.toString(),
        { id: p.userId.toString(), username: p.username, score: p.score || 0, socketId: null, connected: false }
      ])
    ),
    questions: await loadQuestionsForRoom(dbRoom),
    currentIndex: -1,
    currentQuestion: null,
    timeLeft: 0,
    timerInterval: null,
    nextQuestionTimeout: null,
    answers: new Map(),
    usedHints: new Map()
  };

  activeRooms.set(code, room);
  return room;
}

export async function joinRoom(io, socket, { code }) {
  if (!code) return socket.emit('room:error', { message: 'Room code is required' });

  const userId = getUserId(socket.user);
  if (!userId) return socket.emit('room:error', { message: 'Unauthorized socket connection' });

  const room = await getOrLoadRoom(code);
  if (!room) return socket.emit('room:error', { message: 'Room not found' });

  socket.join(code);
  socket.data.roomCode = code;

  const existing = room.players.get(userId);
  room.players.set(userId, {
    id: userId,
    username: socket.user.username || existing?.username || 'Player',
    score: existing?.score ?? 0,
    socketId: socket.id,
    connected: true
  });

  await syncPlayersToDB(room);

  io.to(code).emit('room:state', { room: toPublicRoom(room), players: playersArray(room) });

  if (room.status === 'playing' && room.currentQuestion) {
    socket.emit('question:new', {
      question: {
        id: room.currentQuestion.id,
        text: room.currentQuestion.text,
        options: room.currentQuestion.options
      },
      index: room.currentIndex,
      total: room.questions.length,
      duration: room.timePerQuestion
    });
    socket.emit('timer:tick', { timeLeft: room.timeLeft });
  }
}

export async function startRoom(io, socket, { code }) {
  const userId = getUserId(socket.user);
  const room = activeRooms.get(code);
  if (!room) return socket.emit('room:error', { message: 'Room not found' });
  if (room.hostId !== userId) {
    return socket.emit('room:error', { message: 'Only the host can start the match' });
  }
  if (room.status !== 'lobby') return;
  if (room.questions.length === 0) {
    return socket.emit('room:error', {
      message: 'No questions available for this category yet. Run the seed script first.'
    });
  }

  room.status = 'playing';
  await syncPlayersToDB(room);
  nextQuestion(io, code);
}

function calculatePoints(timeTaken, duration) {
  const ratio = Math.min(1, Math.max(0, timeTaken / duration));
  return Math.max(40, Math.round(100 - ratio * 60));
}

function nextQuestion(io, code) {
  const room = activeRooms.get(code);
  if (!room) return;

  if (room.timerInterval) clearInterval(room.timerInterval);
  room.currentIndex += 1;

  if (room.currentIndex >= room.questions.length) {
    return endGame(io, code);
  }

  room.currentQuestion = room.questions[room.currentIndex];
  room.answers = new Map();
  room.usedHints = new Map();
  room.timeLeft = room.timePerQuestion;

  io.to(code).emit('question:new', {
    question: {
      id: room.currentQuestion.id,
      text: room.currentQuestion.text,
      options: room.currentQuestion.options
    },
    index: room.currentIndex,
    total: room.questions.length,
    duration: room.timePerQuestion
  });

  room.timerInterval = setInterval(() => {
    room.timeLeft -= 1;
    io.to(code).emit('timer:tick', { timeLeft: room.timeLeft });
    if (room.timeLeft <= 0) revealAnswer(io, code);
  }, 1000);
}

export function submitAnswer(io, socket, { code, questionId, optionIndex }) {
  const userId = getUserId(socket.user);
  const room = activeRooms.get(code);
  if (!room || room.status !== 'playing' || !room.currentQuestion) return;
  if (room.currentQuestion.id !== questionId) return;
  if (room.answers.has(userId)) return;

  const timeTaken = room.timePerQuestion - room.timeLeft;
  const isCorrect = optionIndex === room.currentQuestion.correctIndex;
  const points = isCorrect ? calculatePoints(timeTaken, room.timePerQuestion) : 0;

  room.answers.set(userId, { optionIndex, timeTaken, points });

  const player = room.players.get(userId);
  if (player) player.score += points;

  const connectedCount = Array.from(room.players.values()).filter((p) => p.connected).length;
  if (room.answers.size >= connectedCount) {
    revealAnswer(io, code);
  }
}

function revealAnswer(io, code) {
  const room = activeRooms.get(code);
  if (!room || !room.currentQuestion) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  io.to(code).emit('answer:reveal', {
    correctIndex: room.currentQuestion.correctIndex,
    players: playersArray(room)
  });

  syncPlayersToDB(room);

  room.nextQuestionTimeout = setTimeout(() => nextQuestion(io, code), REVEAL_TO_NEXT_QUESTION_DELAY_MS);
}

export async function useHint(io, socket, { code, type }) {
  const userId = getUserId(socket.user);
  const room = activeRooms.get(code);
  if (!room || room.status !== 'playing' || !room.currentQuestion) return;
  if (!HINT_COSTS[type]) return socket.emit('room:error', { message: 'Unknown hint type' });
  if (room.answers.has(userId)) return;

  const usedByPlayer = room.usedHints.get(userId) ?? new Set();
  if (usedByPlayer.has(type)) return;

  try {
    await spendCoins(userId, HINT_COSTS[type], `hint_${type}`, { roomCode: code, questionId: room.currentQuestion.id });
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return socket.emit('room:error', { message: 'Not enough coins' });
    }
    throw err;
  }

  usedByPlayer.add(type);
  room.usedHints.set(userId, usedByPlayer);
  socket.emit('coins:update', { delta: -HINT_COSTS[type] });

  if (type === 'fiftyFifty') {
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== room.currentQuestion.correctIndex);
    const removed = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    socket.emit('hint:applied', { type, removedOptions: removed });
    return;
  }

  if (type === 'freeze') {
    room.timeLeft += 10;
    io.to(code).emit('hint:applied', { type, timeLeft: room.timeLeft });
    return;
  }

  if (type === 'skip') {
    socket.emit('hint:applied', { type });
    revealAnswer(io, code);
  }
}

async function endGame(io, code) {
  const room = activeRooms.get(code);
  if (!room) return;

  room.status = 'ended';
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.nextQuestionTimeout) clearTimeout(room.nextQuestionTimeout);

  const ranked = [...playersArray(room)].sort((a, b) => b.score - a.score);
  const placementByUserId = new Map();
  ranked.forEach((p, i) => {
    const placement = i > 0 && ranked[i - 1].score === p.score ? placementByUserId.get(ranked[i - 1].id) : i + 1;
    placementByUserId.set(p.id, placement);
  });

  const topScore = Math.max(0, ...ranked.map((p) => p.score));

  for (const player of ranked) {
    const reward = player.score === topScore && topScore > 0 ? MATCH_REWARD_WINNER : MATCH_REWARD_PARTICIPANT;
    try {
      await addCoins(player.id, reward, 'match_reward', { roomCode: code });
      const socketInstance = [...io.sockets.sockets.values()].find((s) => s.id === room.players.get(player.id)?.socketId);
      socketInstance?.emit('coins:update', { delta: reward });

      await MatchHistory.create({
        userId: player.id,
        roomCode: code,
        category: room.quizId ? null : room.category,
        quizId: room.quizId,
        quizTitle: room.quizTitle,
        score: player.score,
        placement: placementByUserId.get(player.id),
        totalPlayers: ranked.length,
        coinsEarned: reward
      });
    } catch (err) {
      console.error(`[gameEngine] failed to finalize match for ${player.id}:`, err.message);
    }
  }

  await syncPlayersToDB(room);
  io.to(code).emit('game:end', { players: playersArray(room) });

  setTimeout(() => activeRooms.delete(code), 10 * 60 * 1000);
}

export async function handleDisconnect(io, socket) {
  const code = socket.data.roomCode;
  const userId = getUserId(socket.user);
  if (!code || !userId) return;

  const room = activeRooms.get(code);
  if (!room) return;

  const player = room.players.get(userId);
  if (!player || player.socketId !== socket.id) return;

  player.connected = false;

  await syncPlayersToDB(room);
  io.to(code).emit('room:state', { room: toPublicRoom(room), players: playersArray(room) });
}