import express, { Router } from 'express';
import mongoose from 'mongoose';
import { SLUG_PATTERN } from '../../shared/content.js';
import { isPlainObject, normalizeProfileInput, normalizeProjectInput } from '../../shared/normalize.js';
import { badRequest, HttpError, notFound } from '../lib/http.js';
import {
  detectImageType,
  MAX_IMAGE_BYTES,
  releaseImages,
  saveImage,
  sweepAbandonedUploads,
} from '../lib/images.js';
import {
  findNextProject,
  isImageReferenced,
  PROJECT_SORT,
  projectImageUrls,
} from '../lib/projects.js';
import { PROJECT_SUMMARY_FIELDS, serializeProfile, serializeProject } from '../lib/serialize.js';
import { requireAdmin } from '../middleware/auth.js';
import { noStore } from '../middleware/security.js';
import { Profile, Project } from '../models/index.js';

export const adminRouter = Router();
adminRouter.use(noStore, requireAdmin);

async function findProject(id) {
  const project = mongoose.isObjectIdOrHexString(id) ? await Project.findById(id) : null;
  if (!project) throw notFound('Project not found.');
  return project;
}

const projectJson = (project) => serializeProject(project.toObject());

// ── Projects ────────────────────────────────────────────────────────────────

adminRouter.get('/projects', async (req, res) => {
  const projects = await Project.find()
    .sort(PROJECT_SORT)
    .select(`${PROJECT_SUMMARY_FIELDS} createdAt`)
    .lean();
  res.json({ projects: projects.map(serializeProject) });
});

adminRouter.post('/projects', async (req, res) => {
  const last = await Project.findOne().sort({ order: -1 }).select('order').lean();
  const project = await Project.create({
    ...normalizeProjectInput(req.body),
    order: (last?.order ?? -1) + 1,
  });
  await sweepAbandonedUploads(isImageReferenced);
  res.status(201).json({ project: projectJson(project) });
});

// Registered before "/projects/:id" so "order" is not mistaken for an id.
adminRouter.put('/projects/order', async (req, res) => {
  const ids = isPlainObject(req.body) ? req.body.ids : null;
  const valid =
    Array.isArray(ids) &&
    ids.length <= 500 &&
    ids.every((id) => typeof id === 'string' && mongoose.isObjectIdOrHexString(id));
  if (!valid) throw badRequest('Send the project ids in their new order.');

  const unique = [...new Set(ids)];
  if (unique.length > 0) {
    await Project.bulkWrite(
      unique.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
      })),
    );
  }
  res.json({ ok: true });
});

adminRouter.get('/projects/:id', async (req, res) => {
  res.json({ project: projectJson(await findProject(req.params.id)) });
});

adminRouter.put('/projects/:id', async (req, res) => {
  const project = await findProject(req.params.id);
  const imagesBefore = projectImageUrls(project);

  project.set(normalizeProjectInput(req.body));
  await project.save();

  const imagesAfter = new Set(projectImageUrls(project));
  await releaseImages(
    imagesBefore.filter((url) => !imagesAfter.has(url)),
    isImageReferenced,
  );
  await sweepAbandonedUploads(isImageReferenced);
  res.json({ project: projectJson(project) });
});

// Quick toggles from the project list (featured / published).
adminRouter.patch('/projects/:id', async (req, res) => {
  const project = await findProject(req.params.id);
  const body = isPlainObject(req.body) ? req.body : {};
  if (typeof body.featured === 'boolean') project.featured = body.featured;
  if (body.status !== undefined) project.status = body.status;
  await project.save();
  res.json({ project: projectJson(project) });
});

adminRouter.delete('/projects/:id', async (req, res) => {
  const project = await findProject(req.params.id);
  const images = projectImageUrls(project);
  await project.deleteOne();
  await releaseImages(images, isImageReferenced);
  res.status(204).end();
});

// Lets the admin view any project (including drafts) on its real page.
adminRouter.get('/preview/projects/:slug', async (req, res) => {
  const slug = String(req.params.slug).toLowerCase();
  const project = SLUG_PATTERN.test(slug) ? await Project.findOne({ slug }).lean() : null;
  if (!project) throw notFound('Project not found.');
  res.json({ project: serializeProject(project), next: await findNextProject(project) });
});

// ── Profile ─────────────────────────────────────────────────────────────────

adminRouter.get('/profile', async (req, res) => {
  const profile = await Profile.findOne({ key: 'main' }).lean();
  res.json({ profile: serializeProfile(profile) });
});

adminRouter.put('/profile', async (req, res) => {
  const profile = (await Profile.findOne({ key: 'main' })) ?? new Profile({ key: 'main' });
  profile.set(normalizeProfileInput(req.body));
  await profile.save();
  res.json({ profile: serializeProfile(profile.toObject()) });
});

// ── Image uploads ───────────────────────────────────────────────────────────

adminRouter.post(
  '/uploads',
  express.raw({ type: 'image/*', limit: MAX_IMAGE_BYTES }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new HttpError(400, 'Send the image file as the request body.', { code: 'invalid_upload' });
    }
    const contentType = detectImageType(req.body);
    if (!contentType) {
      throw new HttpError(415, 'Use a JPEG, PNG, WebP, GIF or AVIF image.', { code: 'unsupported_image' });
    }
    const filename =
      String(req.get('x-file-name') ?? '')
        .replace(/[^\w.-]+/g, '-')
        .slice(0, 120) || 'image';
    const id = await saveImage(req.body, { contentType, filename, uploadedBy: req.admin.id });
    res.status(201).json({
      image: { id, url: `/api/images/${id}`, contentType, size: req.body.length },
    });
  },
);
