import mongoose from 'mongoose';

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// One document per failed sign-in, keyed by "email:<address>" and "ip:<addr>".
// Stored in MongoDB (not memory) so limits hold across serverless instances.
const loginAttemptSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, maxlength: 320 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

loginAttemptSchema.index({ key: 1, createdAt: -1 });
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: LOGIN_WINDOW_MS / 1000 });

export const LoginAttempt =
  mongoose.models.LoginAttempt ?? mongoose.model('LoginAttempt', loginAttemptSchema);
