import mongoose from 'mongoose';
import { EMAIL_PATTERN, LIMITS } from '../../shared/content.js';
import { text } from './fields.js';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [LIMITS.email, 'Email is too long.'],
      match: [EMAIL_PATTERN, 'Enter a valid email address.'],
    },
    name: text('Name', LIMITS.name),
    // Never returned unless explicitly requested with .select('+passwordHash').
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Admin = mongoose.models.Admin ?? mongoose.model('Admin', adminSchema);
