// Site-wide portfolio content: identity, contact details and the resume.
// Stored as a single document (key "main").
import mongoose from 'mongoose';
import {
  EMAIL_PATTERN,
  HEX_COLOR_PATTERN,
  LIMITS,
  PHONE_PATTERN,
  TOOL_ICON_KEYS,
} from '../../shared/content.js';
import { maxItems, requiredText, stringList, text, url } from './fields.js';

const { Schema } = mongoose;

const experienceSchema = new Schema(
  {
    title: requiredText('Job title', LIMITS.entryTitle),
    organization: text('Company', LIMITS.entryMeta),
    period: text('Period', LIMITS.period),
  },
  { _id: false },
);

const educationSchema = new Schema(
  {
    degree: requiredText('Degree or course', LIMITS.entryTitle),
    institution: text('Institution', LIMITS.entryMeta),
    location: text('Location', LIMITS.entryMeta),
    period: text('Period', LIMITS.period),
  },
  { _id: false },
);

const certificationSchema = new Schema(
  {
    title: requiredText('Certification', LIMITS.entryTitle),
    issuer: text('Issuer', LIMITS.entryMeta),
  },
  { _id: false },
);

const toolSchema = new Schema(
  {
    name: requiredText('Tool name', LIMITS.toolName),
    icon: {
      type: String,
      default: '',
      enum: { values: ['', ...TOOL_ICON_KEYS], message: 'Choose an icon from the list.' },
    },
    abbr: text('Short label', LIMITS.toolAbbr),
    color: {
      type: String,
      trim: true,
      default: '#8B5CF6',
      match: [HEX_COLOR_PATTERN, 'Use a hex colour such as #A259FF.'],
    },
  },
  { _id: false },
);

const socialSchema = new Schema(
  {
    label: requiredText('Link label', LIMITS.linkLabel),
    url: url('Link URL', { allowRelative: false, required: true }),
  },
  { _id: false },
);

const profileSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    name: requiredText('Name', LIMITS.name),
    role: text('Role', LIMITS.role),
    email: text('Email', LIMITS.email, {
      lowercase: true,
      validate: {
        validator: (value) => !value || EMAIL_PATTERN.test(value),
        message: 'Enter a valid email address.',
      },
    }),
    phone: text('Phone', LIMITS.phone, {
      match: [PHONE_PATTERN, 'Use digits, spaces and + ( ) - only.'],
    }),
    website: url('Website', { allowRelative: false }),
    linkedin: url('LinkedIn URL', { allowRelative: false }),
    availability: text('Availability note', LIMITS.note),
    aboutQuote: text('About quote', LIMITS.quote),
    socials: { type: [socialSchema], default: [], validate: maxItems(LIMITS.socials, 'links') },
    experience: {
      type: [experienceSchema],
      default: [],
      validate: maxItems(LIMITS.listCount, 'experience entries'),
    },
    education: {
      type: [educationSchema],
      default: [],
      validate: maxItems(LIMITS.listCount, 'education entries'),
    },
    certifications: {
      type: [certificationSchema],
      default: [],
      validate: maxItems(LIMITS.listCount, 'certifications'),
    },
    skills: stringList('skill', LIMITS.skill, LIMITS.skills),
    tools: { type: [toolSchema], default: [], validate: maxItems(LIMITS.tools, 'tools') },
  },
  { timestamps: true },
);

export const Profile = mongoose.models.Profile ?? mongoose.model('Profile', profileSchema);
