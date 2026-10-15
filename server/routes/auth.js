import { Router } from 'express';
import { LIMITS, passwordProblem } from '../../shared/content.js';
import { isPlainObject } from '../../shared/normalize.js';
import { badRequest, HttpError } from '../lib/http.js';
import { assertLoginAllowed, clearFailedLogins, recordFailedLogin } from '../lib/loginLimiter.js';
import { getDummyHash, hashPassword, needsRehash, verifyPassword } from '../lib/password.js';
import { serializeAdmin } from '../lib/serialize.js';
import { createSession, destroyOtherSessions, destroySession } from '../lib/sessions.js';
import { optionalAdmin, requireAdmin } from '../middleware/auth.js';
import { noStore } from '../middleware/security.js';
import { Admin } from '../models/index.js';

export const authRouter = Router();
authRouter.use(noStore);

const bodyOf = (req) => (isPlainObject(req.body) ? req.body : {});
const stringField = (body, name) => (typeof body[name] === 'string' ? body[name] : '');

authRouter.post('/login', async (req, res) => {
  const body = bodyOf(req);
  const email = stringField(body, 'email').trim().toLowerCase().slice(0, LIMITS.email);
  const password = stringField(body, 'password');
  if (!email || !password) {
    throw badRequest('Enter your email and password.', {
      ...(email ? {} : { email: 'Email is required.' }),
      ...(password ? {} : { password: 'Password is required.' }),
    });
  }

  const identity = { email, ip: req.ip };
  await assertLoginAllowed(identity);

  const admin = await Admin.findOne({ email }).select('+passwordHash');
  // Always run one hash comparison so unknown emails take as long as wrong passwords.
  const valid = await verifyPassword(password, admin?.passwordHash ?? (await getDummyHash()));
  if (!admin || !valid) {
    await recordFailedLogin(identity);
    throw new HttpError(401, 'Incorrect email or password.', { code: 'invalid_credentials' });
  }

  await clearFailedLogins(identity);
  if (needsRehash(admin.passwordHash)) admin.passwordHash = await hashPassword(password);
  admin.lastLoginAt = new Date();
  await admin.save();

  await createSession(req, res, admin._id);
  res.json({ admin: serializeAdmin(admin) });
});

authRouter.post('/logout', async (req, res) => {
  await destroySession(req, res);
  res.status(204).end();
});

// Answers 200 either way ({ admin: null } when signed out), so checking the
// session on page load doesn't log a failed request in the browser.
authRouter.get('/me', optionalAdmin, (req, res) => {
  res.json({ admin: req.admin ?? null });
});

authRouter.post('/password', requireAdmin, async (req, res) => {
  const body = bodyOf(req);
  const currentPassword = stringField(body, 'currentPassword');
  const newPassword = stringField(body, 'newPassword');

  const admin = await Admin.findById(req.admin.id).select('+passwordHash');
  const identity = { email: admin.email, ip: req.ip };
  await assertLoginAllowed(identity);

  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    await recordFailedLogin(identity);
    const message = 'Your current password is incorrect.';
    throw badRequest(message, { currentPassword: message });
  }

  const problem =
    passwordProblem(newPassword, admin.email) ??
    (newPassword === currentPassword ? 'Choose a password you have not used here before.' : null);
  if (problem) throw badRequest(problem, { newPassword: problem });

  admin.passwordHash = await hashPassword(newPassword);
  admin.passwordChangedAt = new Date();
  await admin.save();
  await destroyOtherSessions(admin._id, req.sessionId);
  res.json({ ok: true });
});
