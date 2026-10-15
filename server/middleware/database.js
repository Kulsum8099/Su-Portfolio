import { connectToDatabase, DatabaseConfigError, describeConnectionError } from '../db.js';
import { HttpError } from '../lib/http.js';

/** Ensures a MongoDB connection before route handlers run. */
export async function withDatabase(req, res, next) {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    if (error instanceof DatabaseConfigError) return next(error);
    // Details go to the server log only; clients get a generic message.
    console.error(`[api] MongoDB connection failed: ${describeConnectionError(error)}`);
    next(new HttpError(503, 'The database is not reachable right now.', { code: 'db_unavailable' }));
  }
}
