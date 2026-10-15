// Standalone Node server: the API, plus the built site from dist/ when it
// exists (after `npm run build`). Used for `npm run dev` (API only, the site
// comes from Vite) and for hosts such as Render, Railway or a VPS.
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import app from './app.js';
import { config } from './config.js';
import { connectToDatabase, describeConnectionError, disconnectFromDatabase } from './db.js';
import { siteSecurityHeaders } from './middleware/security.js';

const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const indexHtml = join(dist, 'index.html');

if (existsSync(indexHtml)) {
  app.use(siteSecurityHeaders);
  // Hashed build assets never change, so they can be cached for a year.
  app.use(
    '/assets',
    express.static(join(dist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }),
  );
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  // Client-side routes (/projects/…, /admin/…) all load the single-page app.
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/api/')) return next();
    res.set('Cache-Control', 'no-cache');
    res.sendFile(indexHtml);
  });
}

const server = app.listen(config.port, () => {
  const site = existsSync(indexHtml) ? 'site + API' : 'API only (the site runs on Vite in development)';
  console.log(`[api] ${site} listening on http://localhost:${config.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[api] Port ${config.port} is already in use. Set PORT in .env to a free port.`);
  } else {
    console.error('[api] Server error:', error);
  }
  process.exit(1);
});

// Connect right away so configuration problems show up at startup instead
// of on the first request.
connectToDatabase().then(
  () => console.log('[api] Connected to MongoDB.'),
  (error) => console.warn(`[api] MongoDB is not connected: ${describeConnectionError(error)}`),
);

const shutdown = () => {
  server.close(() => disconnectFromDatabase().finally(() => process.exit(0)));
  setTimeout(() => process.exit(0), 3000).unref();
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
