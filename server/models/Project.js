import mongoose from 'mongoose';
import { ACCENTS, LIMITS, PROJECT_STATUSES, SLUG_PATTERN } from '../../shared/content.js';
import { maxItems, requiredText, stringList, text, url } from './fields.js';

const { Schema } = mongoose;

// Optional pixel size, so pages can reserve the image's space before it loads.
const dimension = { type: Number, min: 1, max: 20000, default: null };

const imageSchema = new Schema(
  {
    url: url('Image URL'),
    alt: text('Alt text', LIMITS.alt),
    width: dimension,
    height: dimension,
  },
  { _id: false },
);

const screenshotSchema = new Schema(
  {
    url: url('Screenshot URL', { required: true }),
    alt: text('Alt text', LIMITS.alt),
    caption: text('Caption', LIMITS.caption),
    width: dimension,
    height: dimension,
  },
  { _id: false },
);

const linkSchema = new Schema(
  {
    label: requiredText('Link label', LIMITS.linkLabel),
    url: url('Link URL', { required: true }),
  },
  { _id: false },
);

const entrySchema = (label) =>
  new Schema(
    {
      title: requiredText(`${label} title`, LIMITS.itemTitle),
      description: text(`${label} description`, LIMITS.itemBody),
    },
    { _id: false },
  );

const caseStudySchema = new Schema(
  {
    overview: text('Overview', LIMITS.longText),
    problem: text('Problem statement', LIMITS.longText),
    goals: stringList('goal', LIMITS.listItem, LIMITS.listCount),
    research: text('Research', LIMITS.longText),
    solution: text('Solution', LIMITS.longText),
    features: {
      type: [entrySchema('Feature')],
      default: [],
      validate: maxItems(LIMITS.listCount, 'key features'),
    },
    process: {
      type: [entrySchema('Step')],
      default: [],
      validate: maxItems(LIMITS.listCount, 'process steps'),
    },
    gallery: {
      type: [screenshotSchema],
      default: [],
      validate: maxItems(LIMITS.gallery, 'screenshots'),
    },
    outcomes: stringList('outcome', LIMITS.listItem, LIMITS.listCount),
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    title: requiredText('Title', LIMITS.title),
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'URL slug is required.'],
      maxlength: [LIMITS.slug, `URL slug must be ${LIMITS.slug} characters or fewer.`],
      match: [SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens only.'],
    },
    subtitle: text('Subtitle', LIMITS.subtitle),
    category: text('Category', LIMITS.category),
    accent: {
      type: String,
      default: 'pink',
      enum: { values: ACCENTS, message: 'Choose one of the available accent colours.' },
    },
    summary: text('Summary', LIMITS.summary),
    coverImage: { type: imageSchema, default: () => ({}) },
    role: text('Role', LIMITS.meta),
    client: text('Client', LIMITS.meta),
    timeline: text('Timeline', LIMITS.meta),
    technologies: stringList('technology', LIMITS.technology, LIMITS.technologies),
    links: { type: [linkSchema], default: [], validate: maxItems(LIMITS.links, 'links') },
    caseStudy: { type: caseStudySchema, default: () => ({}) },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      default: 'draft',
      enum: { values: PROJECT_STATUSES, message: 'Status must be draft or published.' },
    },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, order: 1 });

projectSchema.pre('save', async function stampPublishDate() {
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
});

export const Project = mongoose.models.Project ?? mongoose.model('Project', projectSchema);
