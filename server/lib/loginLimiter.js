// Brute-force protection for sign-in: at most 5 failed attempts per email
// and 20 per IP address within a rolling 15-minute window.
import mongoose from 'mongoose';
import { LOGIN_WINDOW_MS, LoginAttempt } from '../models/LoginAttempt.js';
import { HttpError } from './http.js';

const LIMITS = { email: 5, ip: 20 };

const keysFor = ({ email, ip }) => ({ email: `email:${email}`, ip: `ip:${ip || 'unknown'}` });

export async function assertLoginAllowed(identity) {
  const keys = keysFor(identity);
  const since = new Date(Date.now() - LOGIN_WINDOW_MS);
  const attempts = await LoginAttempt.find({
    key: mongoose.trusted({ $in: Object.values(keys) }),
    createdAt: mongoose.trusted({ $gt: since }),
  })
    .sort({ createdAt: 1 })
    .select('key createdAt')
    .lean();

  for (const [kind, key] of Object.entries(keys)) {
    const forKey = attempts.filter((attempt) => attempt.key === key);
    if (forKey.length < LIMITS[kind]) continue;
    const retryAfterMs = forKey[0].createdAt.getTime() + LOGIN_WINDOW_MS - Date.now();
    const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    const minutes = Math.ceil(seconds / 60);
    throw new HttpError(
      429,
      `Too many sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      { code: 'rate_limited', headers: { 'Retry-After': String(seconds) } },
    );
  }
}

export async function recordFailedLogin(identity) {
  const keys = keysFor(identity);
  await LoginAttempt.insertMany([{ key: keys.email }, { key: keys.ip }]);
}

export async function clearFailedLogins(identity) {
  await LoginAttempt.deleteMany({ key: keysFor(identity).email });
}
