import { createHash, randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { config } from '../config.js';
import { Session } from '../models/index.js';
import { parseCookies } from './cookies.js';

export const SESSION_COOKIE = 'su_admin_session';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/; // 32 random bytes, base64url
export const ABSOLUTE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export const sessionTtlMs = () => config.sessionTtlHours * 60 * 60 * 1000;
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// HttpOnly: not readable from JavaScript. SameSite=Strict: never sent on
// cross-site requests. Secure whenever the request arrived over HTTPS.
const cookieOptions = (req) => ({
  httpOnly: true,
  secure: req.secure,
  sameSite: 'strict',
  path: '/',
});

export function readSessionToken(req) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  return token && TOKEN_PATTERN.test(token) ? token : null;
}

export function setSessionCookie(req, res, token) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(req), maxAge: sessionTtlMs() });
}

export function clearSessionCookie(req, res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions(req));
}

export async function createSession(req, res, adminId) {
  // A fresh token on every sign-in (prevents session fixation).
  const previous = readSessionToken(req);
  if (previous) await Session.deleteOne({ _id: hashToken(previous) });

  const token = randomBytes(32).toString('base64url');
  await Session.create({
    _id: hashToken(token),
    admin: adminId,
    expiresAt: new Date(Date.now() + sessionTtlMs()),
    userAgent: (req.get('user-agent') ?? '').slice(0, 300),
    ip: (req.ip ?? '').slice(0, 64),
  });
  setSessionCookie(req, res, token);
}

export async function destroySession(req, res) {
  const token = readSessionToken(req);
  if (token) await Session.deleteOne({ _id: hashToken(token) });
  clearSessionCookie(req, res);
}

/** Signs the admin out everywhere except the current browser. */
export async function destroyOtherSessions(adminId, currentSessionId) {
  await Session.deleteMany({ admin: adminId, _id: mongoose.trusted({ $ne: currentSessionId }) });
}
