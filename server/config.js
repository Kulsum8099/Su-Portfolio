// Validated runtime configuration. Every value comes from environment
// variables (see .env.example); nothing secret is hard-coded here.
import './env.js';

const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Express "trust proxy" setting. The default (1) trusts exactly one proxy
// hop, which matches Vercel, Render, Railway and a single nginx in front.
const trustProxy = (value) => {
  if (!value) return 1;
  if (value === 'true') return true;
  if (value === 'false') return false;
  const hops = Number.parseInt(value, 10);
  return String(hops) === value ? hops : value;
};

const list = (value) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean);

export const config = Object.freeze({
  port: positiveInt(process.env.PORT, 5050),
  mongoUri: (process.env.MONGODB_URI ?? '').trim(),
  mongoDbName: (process.env.MONGODB_DB_NAME ?? '').trim(),
  sessionTtlHours: positiveInt(process.env.SESSION_TTL_HOURS, 12),
  allowedOrigins: list(process.env.ALLOWED_ORIGINS),
  trustProxy: trustProxy(process.env.TRUST_PROXY?.trim()),
});
