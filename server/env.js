// Loads a local `.env` file during development. Hosting platforms (Vercel,
// Render, …) inject real environment variables instead, so a missing file is
// fine. Variables already present in the environment are never overwritten.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath)) {
  try {
    const values = parseEnv(readFileSync(envPath, 'utf8'));
    for (const [key, value] of Object.entries(values)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch (error) {
    console.warn(`[config] Could not read ${envPath}: ${error.message}`);
  }
}
