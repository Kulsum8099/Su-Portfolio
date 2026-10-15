// Content rules shared by the API (validation) and the admin panel (instant
// form feedback), so both sides always agree on what is valid.

export const ACCENTS = ['pink', 'green', 'purple', 'blue'];
export const PROJECT_STATUSES = ['draft', 'published'];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[+()\d\s.-]*$/;
export const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 200;

// Brand icons the resume "Tools" card can render. Anything else falls back
// to a coloured letter tile (e.g. Adobe apps, which icon sets no longer ship).
export const TOOL_ICON_KEYS = [
  'figma',
  'sketch',
  'framer',
  'miro',
  'notion',
  'webflow',
  'canva',
  'invision',
  'maze',
  'rive',
  'lottiefiles',
  'blender',
  'cinema4d',
  'affinitydesigner',
  'jira',
  'slack',
  'html5',
  'css',
  'react',
  'wordpress',
  'openai',
  'claude',
  'googlegemini',
];

export const LIMITS = {
  title: 120,
  slug: 80,
  subtitle: 160,
  category: 60,
  summary: 600,
  meta: 120,
  technology: 40,
  technologies: 30,
  linkLabel: 60,
  links: 8,
  url: 2048,
  alt: 300,
  caption: 300,
  longText: 8000,
  listItem: 300,
  listCount: 20,
  itemTitle: 120,
  itemBody: 2000,
  gallery: 30,
  name: 80,
  role: 80,
  email: 254,
  phone: 40,
  note: 160,
  quote: 300,
  entryTitle: 160,
  entryMeta: 160,
  period: 40,
  skill: 60,
  skills: 40,
  tools: 24,
  toolName: 40,
  toolAbbr: 3,
  socials: 8,
};

/** Returns a reason the password is too weak, or null when it is acceptable. */
export function passwordProblem(password, email = '') {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  if (email && password.toLowerCase() === email.toLowerCase()) return 'Do not use your email as the password.';
  if (/^(.)\1+$/.test(password)) return 'Avoid repeating a single character.';
  return null;
}

/** Turns "Medi-Connect: Healthcare" into "medi-connect-healthcare". */
export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITS.slug)
    .replace(/-+$/g, '');
}

/**
 * Accepts absolute http(s) URLs and, optionally, site-relative paths such as
 * "/api/images/<id>". Rejects every other scheme (javascript:, data:, …) so a
 * stored value can never turn into script when rendered as a link or image.
 */
export function isSafeUrl(value, { allowRelative = true } = {}) {
  if (typeof value !== 'string' || value === '') return false;
  if (/\s/.test(value) || value.includes('\\')) return false;
  if (value.startsWith('/')) return allowRelative && !value.startsWith('//');
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}
