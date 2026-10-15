import { pipeline } from 'node:stream/promises';
import { Router } from 'express';
import { SLUG_PATTERN } from '../../shared/content.js';
import { notFound } from '../lib/http.js';
import { findImage, IMAGE_ID_PATTERN, openImageStream } from '../lib/images.js';
import { findNextProject, PROJECT_SORT } from '../lib/projects.js';
import { PROJECT_SUMMARY_FIELDS, serializeProfile, serializeProject } from '../lib/serialize.js';
import { Profile, Project } from '../models/index.js';

export const publicRouter = Router();

// Browsers always revalidate (cheap 304s via ETag), so a visitor never sees
// stale content after an admin edit. CDNs that support CDN-Cache-Control
// (Vercel, Cloudflare…) may reuse a response for 30s and refresh it in the
// background, which keeps traffic spikes cheap; edits reach them in ~30s.
const cachePublic = (res) =>
  res.set({
    'Cache-Control': 'no-cache',
    'CDN-Cache-Control': 'max-age=30, stale-while-revalidate=300',
  });

publicRouter.get('/projects', async (req, res) => {
  const projects = await Project.find({ status: 'published' })
    .sort(PROJECT_SORT)
    .select(PROJECT_SUMMARY_FIELDS)
    .lean();
  cachePublic(res);
  res.json({ projects: projects.map(serializeProject) });
});

publicRouter.get('/projects/:slug', async (req, res) => {
  const slug = String(req.params.slug).toLowerCase();
  const project = SLUG_PATTERN.test(slug)
    ? await Project.findOne({ slug, status: 'published' }).lean()
    : null;
  if (!project) throw notFound('Project not found.');
  cachePublic(res);
  res.json({ project: serializeProject(project), next: await findNextProject(project) });
});

publicRouter.get('/profile', async (req, res) => {
  const profile = await Profile.findOne({ key: 'main' }).lean();
  cachePublic(res);
  res.json({ profile: serializeProfile(profile) });
});

publicRouter.get('/images/:id', async (req, res) => {
  const { id } = req.params;
  const file = IMAGE_ID_PATTERN.test(id) ? await findImage(id) : null;
  if (!file) throw notFound('Image not found.');

  const etag = `"${id}"`;
  res.set({
    'Content-Type': file.metadata?.contentType ?? 'application/octet-stream',
    // Uploads are immutable (a new upload gets a new id), so cache forever.
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    ETag: etag,
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  if (req.get('if-none-match') === etag) return res.status(304).end();

  res.set('Content-Length', String(file.length));
  if (req.method === 'HEAD') return res.end();

  try {
    await pipeline(openImageStream(id), res);
  } catch (error) {
    // The visitor navigating away mid-download is not an error worth logging.
    if (error?.code !== 'ERR_STREAM_PREMATURE_CLOSE') throw error;
  }
});
