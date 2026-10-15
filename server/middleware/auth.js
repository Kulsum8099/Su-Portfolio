import { HttpError, unauthorized } from '../lib/http.js';
import { serializeAdmin } from '../lib/serialize.js';
import {
  ABSOLUTE_LIFETIME_MS,
  clearSessionCookie,
  hashToken,
  readSessionToken,
  sessionTtlMs,
  setSessionCookie,
} from '../lib/sessions.js';
import { Admin, Session } from '../models/index.js';

/**
 * Resolves the signed-in admin from the session cookie. Sessions must be
 * unexpired and belong to an existing account with the admin role. Sets
 * req.admin / req.sessionId when signed in.
 */
async function loadSession(req, res) {
  const token = readSessionToken(req);
  if (!token) return { admin: null };

  const session = await Session.findById(hashToken(token)).lean();
  const now = Date.now();
  const expired =
    !session ||
    session.expiresAt.getTime() <= now ||
    now - session.createdAt.getTime() > ABSOLUTE_LIFETIME_MS;

  if (expired) {
    if (session) await Session.deleteOne({ _id: session._id });
    clearSessionCookie(req, res);
    return { admin: null, expired: true };
  }

  const admin = await Admin.findById(session.admin).lean();
  if (!admin) {
    await Session.deleteOne({ _id: session._id });
    clearSessionCookie(req, res);
    return { admin: null };
  }
  if (admin.role !== 'admin') {
    throw new HttpError(403, 'You do not have access to the admin panel.', { code: 'forbidden' });
  }

  // Sliding expiry: an active admin is never signed out mid-edit, while an
  // idle session still ends after SESSION_TTL_HOURS.
  if (session.expiresAt.getTime() - now < sessionTtlMs() / 2) {
    await Session.updateOne({ _id: session._id }, { $set: { expiresAt: new Date(now + sessionTtlMs()) } });
    setSessionCookie(req, res, token);
  }

  req.admin = serializeAdmin(admin);
  req.sessionId = session._id;
  return { admin: req.admin };
}

/** Authentication + authorization for every admin route. */
export async function requireAdmin(req, res, next) {
  const { admin, expired } = await loadSession(req, res);
  if (!admin) return next(unauthorized(expired ? 'Your session has expired. Please sign in again.' : undefined));
  next();
}

/** For "who am I" checks: continues either way, with req.admin set when signed in. */
export async function optionalAdmin(req, res, next) {
  await loadSession(req, res);
  next();
}
