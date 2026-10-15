// Password hashing with Node's built-in scrypt (memory-hard, OWASP-approved),
// so no native add-on is needed. Hashes are self-describing
// ("scrypt$N$r$p$salt$hash") which lets the cost be raised later.
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

// OWASP Password Storage Cheat Sheet: N=2^15, r=8, p=3 (≈32 MiB per hash).
const PARAMS = { N: 2 ** 15, r: 8, p: 3 };
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

const derive = (password, salt, { N, r, p }) =>
  scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r, p, maxmem: MAX_MEMORY });

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, PARAMS);
  const { N, r, p } = PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

function parse(stored) {
  const parts = typeof stored === 'string' ? stored.split('$') : [];
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isSafeInteger)) return null;
  return { N, r, p, salt: Buffer.from(parts[4], 'base64'), key: Buffer.from(parts[5], 'base64') };
}

export async function verifyPassword(password, stored) {
  const parsed = parse(stored);
  if (!parsed || typeof password !== 'string') return false;
  const candidate = await derive(password, parsed.salt, parsed);
  return candidate.length === parsed.key.length && timingSafeEqual(candidate, parsed.key);
}

/** True when a hash was made with weaker parameters than the current ones. */
export function needsRehash(stored) {
  const parsed = parse(stored);
  return !parsed || parsed.N < PARAMS.N || parsed.r < PARAMS.r || parsed.p < PARAMS.p;
}

// Verifying against a throwaway hash when the email is unknown keeps the
// response time the same, so sign-in can't be used to discover accounts.
let dummyHash;
export async function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(24).toString('base64'));
  return dummyHash;
}
