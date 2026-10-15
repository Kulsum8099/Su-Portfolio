import { Project } from '../models/index.js';
import { PROJECT_SUMMARY_FIELDS, serializeProject } from './serialize.js';

export const PROJECT_SORT = { order: 1, createdAt: -1 };

/** Every image URL a project uses (cover + screenshots). */
export const projectImageUrls = (project) =>
  [project.coverImage?.url, ...(project.caseStudy?.gallery ?? []).map((shot) => shot.url)].filter(
    Boolean,
  );

export const isImageReferenced = async (url) =>
  Boolean(await Project.exists({ $or: [{ 'coverImage.url': url }, { 'caseStudy.gallery.url': url }] }));

/** The published project that follows `project` (wrapping around), for "Next project" links. */
export async function findNextProject(project) {
  const published = await Project.find({ status: 'published' })
    .sort(PROJECT_SORT)
    .select(PROJECT_SUMMARY_FIELDS)
    .lean();
  const others = published.filter((item) => String(item._id) !== String(project._id));
  if (others.length === 0) return null;
  const index = published.findIndex((item) => String(item._id) === String(project._id));
  const next = index === -1 ? others[0] : published[(index + 1) % published.length];
  return serializeProject(next);
}
