import express from 'express';
import http from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roomRoutes from './routes/room.routes.js';
import categoryRoutes from './routes/category.routes.js';
import referralRoutes from './routes/referral.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

await connectDB();

const app = express();

// Behind a reverse proxy (Render, Fly, nginx, etc.) req.ip would
// otherwise resolve to the proxy's address, breaking rate limiting.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// General API limiter: generous, just a backstop against abuse/scraping.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Auth endpoints get a much tighter limiter — this is what actually
// matters for stopping password brute-forcing / account enumeration.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/health', (req, res) => res.json({ ok: true, service: 'chella-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/quizzes', quizRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSockets(httpServer);

httpServer.listen(env.port, () => {
  console.log(`[chella-api] listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
