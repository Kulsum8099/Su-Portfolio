import mongoose from 'mongoose';
import { DatabaseConfigError } from '../db.js';
import { HttpError } from '../lib/http.js';

const send = (res, status, error) => res.status(status).json({ error });

const DATABASE_DOWN = new Set([
  'MongooseServerSelectionError',
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoTopologyClosedError',
  'MongoNotConnectedError',
]);

const DUPLICATE_MESSAGES = {
  slug: 'Another project already uses this URL slug.',
  email: 'An admin with this email already exists.',
};

export function notFoundHandler(req, res) {
  send(res, 404, { message: 'This API route does not exist.', code: 'not_found' });
}

// Express recognises error middleware by its four parameters.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    if (error.headers) res.set(error.headers);
    return send(res, error.status, { message: error.message, code: error.code, fields: error.fields });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const fields = {};
    for (const [path, detail] of Object.entries(error.errors)) {
      // Nested documents also report a summary error for the parent path; keep the specific ones.
      if (detail instanceof mongoose.Error.ValidationError) continue;
      fields[path] = detail.message;
    }
    return send(res, 400, {
      message: 'Some fields need attention.',
      code: 'validation_failed',
      fields,
    });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0] ?? 'value';
    const message = DUPLICATE_MESSAGES[field] ?? 'This value is already in use.';
    return send(res, 409, { message, code: 'duplicate', fields: { [field]: message } });
  }

  if (error instanceof mongoose.Error.CastError) {
    return send(res, 400, { message: 'A value has the wrong format.', code: 'invalid_value' });
  }

  if (error instanceof DatabaseConfigError) {
    return send(res, 503, { message: error.message, code: 'db_not_configured' });
  }

  if (DATABASE_DOWN.has(error?.name)) {
    console.error('[api] database unavailable:', error.message);
    return send(res, 503, { message: 'The database is temporarily unavailable.', code: 'db_unavailable' });
  }

  // body-parser errors (invalid JSON, payload too large, wrong charset…)
  if (error?.type === 'entity.too.large') {
    const message = req.path.endsWith('/uploads')
      ? 'Images must be 4 MB or smaller.'
      : 'The request is too large.';
    return send(res, 413, { message, code: 'payload_too_large' });
  }
  if (error?.type === 'entity.parse.failed') {
    return send(res, 400, { message: 'The request body is not valid JSON.', code: 'invalid_json' });
  }
  if (error?.expose && error.status >= 400 && error.status < 500) {
    return send(res, error.status, { message: error.message, code: 'invalid_request' });
  }

  console.error('[api] unexpected error:', error);
  return send(res, 500, { message: 'Something went wrong on our side.', code: 'internal_error' });
}
