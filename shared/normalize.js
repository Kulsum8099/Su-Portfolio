// Turns untrusted request/form data into the exact shape the database
// stores: only known fields, strings trimmed, empty rows dropped. The API
// runs this before validation; the admin panel runs it before saving so the
// rows on screen line up with any field errors the API returns.
import { slugify } from './content.js';

const MAX_ROWS = 100; // hard cap before validation so oversized arrays stay cheap

export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const obj = (value) => (isPlainObject(value) ? value : {});

const str = (value) => {
  if (typeof value === 'string') return value.replace(/\r\n?/g, '\n').trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

const rows = (value, mapRow) => (Array.isArray(value) ? value.slice(0, MAX_ROWS).map(mapRow) : []);
const strings = (value) => [...new Set(rows(value, str).filter(Boolean))];
const hasContent = (row) =>
  Object.values(row).some((field) => (typeof field === 'string' ? field !== '' : field != null));
const pick = (value, fields) => {
  const source = obj(value);
  return Object.fromEntries(fields.map((field) => [field, str(source[field])]));
};

// Pixel size of an image (lets pages reserve space before it loads).
const dimension = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= 20000 ? number : null;
};
const image = (value, fields) => {
  const source = obj(value);
  const filled = pick(source, fields);
  // Size only matters once there is a URL to describe.
  if (!filled.url) return { ...filled, width: null, height: null };
  return { ...filled, width: dimension(source.width), height: dimension(source.height) };
};

export function normalizeProjectInput(body) {
  const source = obj(body);
  const caseStudy = obj(source.caseStudy);
  const entry = (value) => pick(value, ['title', 'description']);

  return {
    title: str(source.title),
    slug: slugify(str(source.slug) || str(source.title)),
    subtitle: str(source.subtitle),
    category: str(source.category),
    accent: str(source.accent) || 'pink',
    summary: str(source.summary),
    coverImage: image(source.coverImage, ['url', 'alt']),
    role: str(source.role),
    client: str(source.client),
    timeline: str(source.timeline),
    technologies: strings(source.technologies),
    links: rows(source.links, (value) => pick(value, ['label', 'url'])).filter(hasContent),
    featured: source.featured === true,
    status: source.status === 'published' ? 'published' : 'draft',
    caseStudy: {
      overview: str(caseStudy.overview),
      problem: str(caseStudy.problem),
      goals: strings(caseStudy.goals),
      research: str(caseStudy.research),
      solution: str(caseStudy.solution),
      features: rows(caseStudy.features, entry).filter(hasContent),
      process: rows(caseStudy.process, entry).filter(hasContent),
      gallery: rows(caseStudy.gallery, (value) => image(value, ['url', 'alt', 'caption'])).filter(
        hasContent,
      ),
      outcomes: strings(caseStudy.outcomes),
    },
  };
}

export function normalizeProfileInput(body) {
  const source = obj(body);
  return {
    name: str(source.name),
    role: str(source.role),
    email: str(source.email).toLowerCase(),
    phone: str(source.phone),
    website: str(source.website),
    linkedin: str(source.linkedin),
    availability: str(source.availability),
    aboutQuote: str(source.aboutQuote),
    socials: rows(source.socials, (value) => pick(value, ['label', 'url'])).filter(hasContent),
    experience: rows(source.experience, (value) =>
      pick(value, ['title', 'organization', 'period']),
    ).filter(hasContent),
    education: rows(source.education, (value) =>
      pick(value, ['degree', 'institution', 'location', 'period']),
    ).filter(hasContent),
    certifications: rows(source.certifications, (value) => pick(value, ['title', 'issuer'])).filter(
      hasContent,
    ),
    skills: strings(source.skills),
    tools: rows(source.tools, (value) => {
      const tool = pick(value, ['name', 'icon', 'abbr', 'color']);
      return { ...tool, color: tool.color || '#8B5CF6' };
    }).filter((tool) => tool.name || tool.icon || tool.abbr),
  };
}
