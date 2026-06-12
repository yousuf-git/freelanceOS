import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.userId = payload.userId;
      socket.accountId = payload.accountId;
      socket.role = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const accountId = socket.accountId;
    if (accountId) {
      socket.join(`account:${accountId}`);
      console.log(`Socket ${socket.id} joined room account:${accountId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
}

/**
 * Emit an event to all sockets in an account room.
 * @param {string} accountId
 * @param {string} event
 * @param {*} data
 */
export function emitToAccount(accountId, event, data) {
  if (!io) return;
  io.to(`account:${accountId}`).emit(event, data);
}

export function getIO() {
  return io;
}
