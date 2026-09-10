import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import * as gameEngine from './gameEngine.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true }
  });

  // Every socket must carry a valid JWT (the same one used for REST calls),
  // so gameplay events are always tied to a real, authenticated user.
  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.auth || {};
      if (!token) return next(new Error('Missing auth token'));

      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('User not found'));

      socket.user = { id: user._id.toString(), username: user.username };
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // Wraps every event handler so that (a) a non-object payload (null,
  // a string, a number — anything a hostile or buggy client might send)
  // is normalized to {} instead of blowing up a destructure, and (b) an
  // unexpected error in one handler can't crash the process for every
  // other connected player.
  function safeHandler(handler) {
    return (payload) => {
      const safePayload = payload && typeof payload === 'object' ? payload : {};
      Promise.resolve(handler(safePayload)).catch((err) => {
        console.error('[sockets] handler error:', err);
      });
    };
  }

  io.on('connection', (socket) => {
    socket.on('room:join', safeHandler((payload) => gameEngine.joinRoom(io, socket, payload)));
    socket.on('room:start', safeHandler((payload) => gameEngine.startRoom(io, socket, payload)));
    socket.on('answer:submit', safeHandler((payload) => gameEngine.submitAnswer(io, socket, payload)));
    socket.on('hint:use', safeHandler((payload) => gameEngine.useHint(io, socket, payload)));
    socket.on('disconnect', () => gameEngine.handleDisconnect(io, socket));
  });

  return io;
}
