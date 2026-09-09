import express from 'express';
import http from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roomRoutes from './routes/room.routes.js';
import categoryRoutes from './routes/category.routes.js';
import referralRoutes from './routes/referral.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

await connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'chella-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/referrals', referralRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSockets(httpServer);

httpServer.listen(env.port, () => {
  console.log(`[chella-api] listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
