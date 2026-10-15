// Public portfolio content. Data comes from the API (MongoDB); when the API
// can't be reached — offline, not deployed yet, or the database is down —
// the built-in copy in src/data is used so the site always renders.
import { fallbackProfile } from '../data/profileData';
import { fallbackProjects } from '../data/projectsData';
import { useResource, fetchResource } from './resource';
import { ApiError, apiRequest } from './api';

let warned = false;
function fallBackOrThrow(error) {
  if (!(error instanceof ApiError) || !error.isUnavailable) throw error;
  if (!warned && import.meta.env.DEV) {
    warned = true;
    console.info(`[content] API unavailable (${error.message}) — showing the built-in content from src/data.`);
  }
}

export async function loadProjects() {
  try {
    const { projects } = await apiRequest('/projects');
    return projects;
  } catch (error) {
    fallBackOrThrow(error);
    return fallbackProjects;
  }
}

export async function loadProfile() {
  try {
    const { profile } = await apiRequest('/profile');
    return profile ?? fallbackProfile; // nothing saved in the database yet
  } catch (error) {
    fallBackOrThrow(error);
    return fallbackProfile;
  }
}

/** A project's full case study plus the project that follows it. */
export async function loadCaseStudy(slug, { preview = false } = {}) {
  const encoded = encodeURIComponent(slug);
  if (preview) return apiRequest(`/admin/preview/projects/${encoded}`);
  try {
    return await apiRequest(`/projects/${encoded}`);
  } catch (error) {
    fallBackOrThrow(error);
    const index = fallbackProjects.findIndex((project) => project.slug === slug);
    if (index === -1) throw new ApiError('Project not found.', { status: 404, code: 'not_found' });
    const next = fallbackProjects.length > 1 ? fallbackProjects[(index + 1) % fallbackProjects.length] : null;
    return { project: fallbackProjects[index], next };
  }
}

const caseStudyKey = (slug, preview) => `${preview ? 'preview' : 'project'}:${slug}`;

export const useProjects = () => useResource('projects', loadProjects);
export const useProfile = () => useResource('profile', loadProfile);
export const useCaseStudy = (slug, { preview = false } = {}) =>
  useResource(caseStudyKey(slug, preview), () => loadCaseStudy(slug, { preview }), {
    maxAgeMs: preview ? 0 : 60_000,
  });

/** Starts loading shared content before the first render. */
export function preloadPublicContent() {
  fetchResource('projects', loadProjects).catch(() => {});
  fetchResource('profile', loadProfile).catch(() => {});
}

/** Warms the cache when a visitor is about to open a case study (hover/focus). */
export function prefetchCaseStudy(slug) {
  fetchResource(caseStudyKey(slug, false), () => loadCaseStudy(slug)).catch(() => {});
}
