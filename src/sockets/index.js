import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import * as gameEngine from './gameEngine.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true }
  });

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Missing auth token'));

      const payload = verifyToken(token);
      
      // Check all common JWT user ID claim keys
      const userId = payload.sub || payload.id || payload.userId;
      if (!userId) {
        console.error('[Socket Auth] Token missing user ID in payload:', payload);
        return next(new Error('Invalid token payload structure'));
      }

      const user = await User.findById(userId).select('_id username email');
      if (!user) {
        console.error(`[Socket Auth] No database user found for ID: ${userId}`);
        return next(new Error('User not found'));
      }

      socket.user = { 
        id: user._id.toString(), 
        username: user.username 
      };
      
      console.log(`[Socket Auth] Authenticated user: ${user.username} (${user._id})`);
      next();
    } catch (err) {
      console.error('[Socket Auth] JWT Verification error:', err.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] Socket ID: ${socket.id} | User: ${socket.user.username} (${socket.user.id})`);

    socket.on('room:join', (payload) => {
      console.log(`[Event: room:join] User ${socket.user.id} joined code: ${payload?.code}`);
      gameEngine.joinRoom(io, socket, payload);
    });

    socket.on('room:start', (payload) => {
      console.log(`[Event: room:start] User ${socket.user.id} attempting start for code: ${payload?.code}`);
      gameEngine.startRoom(io, socket, payload);
    });

    socket.on('answer:submit', (payload) => {
      gameEngine.submitAnswer(io, socket, payload);
    });

    socket.on('hint:use', (payload) => {
      gameEngine.useHint(io, socket, payload);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] ${socket.user.username} (${socket.id}) - Reason: ${reason}`);
      gameEngine.handleDisconnect(io, socket);
    });
  });

  return io;
}