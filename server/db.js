import mongoose from 'mongoose';
import { config } from './config.js';

// Wrap any user-supplied `{ "$gt": … }` style objects in query filters in
// `$eq`, so request data can never inject MongoDB query operators. Queries
// that need operators on purpose wrap them in `mongoose.trusted()`.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export const DEFAULT_DB_NAME = 'su_portfolio';

export class DatabaseConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

/** MONGODB_DB_NAME wins, then a database named in the URI path, then the default. */
export function resolveDbName(uri, explicitName) {
  if (explicitName) return explicitName;
  const match = /^mongodb(?:\+srv)?:\/\/[^/?#]+\/([^?#]*)/i.exec(uri ?? '');
  return (match?.[1] && decodeURIComponent(match[1])) || DEFAULT_DB_NAME;
}

// A single connection per process, kept on globalThis so warm serverless
// invocations (and dev reloads) reuse it instead of opening new ones.
const state = (globalThis.__suPortfolioDb ??= { promise: null });

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!config.mongoUri) {
    throw new DatabaseConfigError(
      'MONGODB_URI is not set. Add it to your environment variables (see DATABASE_SETUP.md).',
    );
  }
  if (!/^mongodb(\+srv)?:\/\//i.test(config.mongoUri)) {
    throw new DatabaseConfigError('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  }

  state.promise ??= mongoose
    .connect(config.mongoUri, {
      dbName: resolveDbName(config.mongoUri, config.mongoDbName),
      appName: 'su-portfolio',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
    .catch((error) => {
      state.promise = null;
      throw error;
    });

  await state.promise;
  return mongoose.connection;
}

export async function disconnectFromDatabase() {
  state.promise = null;
  await mongoose.disconnect();
}

/** Human-friendly hint for the most common connection failures (never includes secrets). */
export function describeConnectionError(error) {
  const text = `${error?.name ?? ''} ${error?.message ?? ''} ${error?.cause?.message ?? ''}`;
  if (error instanceof DatabaseConfigError) return error.message;
  if (/bad auth|authentication failed|auth.*failed/i.test(text)) {
    return 'Authentication failed: check the database username and password in MONGODB_URI (URL-encode special characters).';
  }
  if (/querySrv|ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(text)) {
    return 'Host not found: check the cluster hostname in MONGODB_URI and your internet/DNS connection.';
  }
  if (/ECONNREFUSED/i.test(text)) {
    return 'Connection refused: is MongoDB running on the host and port in MONGODB_URI?';
  }
  if (/Server selection timed out|timed out|ETIMEDOUT|whitelist|IP.*access/i.test(text)) {
    return 'Timed out: if you use MongoDB Atlas, add this machine/host IP under Network Access, then retry.';
  }
  if (/SSL|TLS|certificate/i.test(text)) {
    return 'TLS error: make sure the URI matches your provider (Atlas requires TLS, which mongodb+srv enables).';
  }
  return error?.message ?? 'Unknown database error.';
}
