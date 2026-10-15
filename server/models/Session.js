import mongoose from 'mongoose';

// Admin sign-in sessions. The _id is the SHA-256 hash of the random token in
// the session cookie, so a database leak never exposes a usable session.
// MongoDB's TTL monitor deletes sessions once `expiresAt` has passed.
const sessionSchema = new mongoose.Schema(
  {
    _id: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, default: '', maxlength: 300 },
    ip: { type: String, default: '', maxlength: 64 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session ?? mongoose.model('Session', sessionSchema);
