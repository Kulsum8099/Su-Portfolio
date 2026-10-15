import { config } from '../config.js';
import { HttpError } from '../lib/http.js';

export function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  });
  next();
}

// Content Security Policy for the site itself. Keep in sync with the
// "headers" section of vercel.json, which applies the same policy there.
const SITE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

/** Headers for the HTML/JS/CSS of the site when served by server/index.js. */
export function siteSecurityHeaders(req, res, next) {
  res.set({
    'Content-Security-Policy': [...SITE_CSP, ...(req.secure ? ['upgrade-insecure-requests'] : [])].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  });
  next();
}

/** Admin and auth responses must never be stored by browsers or CDNs. */
export function noStore(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isAllowedOrigin(origin, { host, forwardedHost, allowed = config.allowedOrigins }) {
  const normalized = origin.replace(/\/+$/, '');
  if (allowed.includes(normalized)) return true;
  let originHost;
  try {
    originHost = new URL(normalized).host;
  } catch {
    return false;
  }
  return originHost === host || (Boolean(forwardedHost) && originHost === forwardedHost);
}

/**
 * CSRF defence in depth (session cookies are already SameSite=Strict):
 * state-changing requests must come from this site's own pages.
 */
export function requireSameOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const blocked = new HttpError(403, 'Cross-site requests are not allowed.', { code: 'forbidden_origin' });
  if (req.get('sec-fetch-site') === 'cross-site') return next(blocked);

  const origin = req.get('origin');
  // Browsers always send Origin on these requests; tools like curl don't, and
  // they cannot carry a victim's cookies, so they are not a CSRF vector.
  if (!origin) return next();

  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  return isAllowedOrigin(origin, { host: req.get('host'), forwardedHost }) ? next() : next(blocked);
}
