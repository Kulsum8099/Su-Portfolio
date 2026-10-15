// The Express application behind every /api route. It runs unchanged as a
// local server (server/index.js) and as a Vercel Serverless Function
// (api/index.js).
import express from 'express';
import mongoose from 'mongoose';
import { config } from './config.js';
import { connectToDatabase, DatabaseConfigError } from './db.js';
import { withDatabase } from './middleware/database.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { requireSameOrigin, securityHeaders } from './middleware/security.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';

async function health(req, res) {
  let database = 'connected';
  try {
    await connectToDatabase();
    await mongoose.connection.db.command({ ping: 1 });
  } catch (error) {
    database = error instanceof DatabaseConfigError ? 'not_configured' : 'unreachable';
  }
  res.set('Cache-Control', 'no-store');
  res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'ok' : 'degraded',
    database,
  });
}

function createApiRouter() {
  const api = express.Router();
  api.use(securityHeaders);
  api.get('/health', health);
  api.use(requireSameOrigin);
  api.use(express.json({ limit: '256kb' }));
  api.use(['/auth', '/admin', '/projects', '/profile', '/images'], withDatabase);
  api.use('/auth', authRouter);
  api.use('/admin', adminRouter);
  api.use(publicRouter);
  api.use(notFoundHandler);
  api.use(errorHandler);
  return api;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use('/api', createApiRouter());
  return app;
}

export default createApp();
