// Vercel Serverless Function. vercel.json rewrites every /api/* request here,
// and the same Express app that runs locally handles it.
import app from '../server/app.js';

export default app;
