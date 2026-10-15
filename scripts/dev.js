// `npm run dev`: the API (restarted automatically on changes) and the Vite
// dev server, side by side. Vite proxies /api to the API (vite.config.js).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const children = [
  spawn(process.execPath, ['--watch', 'server/index.js'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
  }),
];

let stopping = false;
const stopAll = (code) => {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = code;
};

for (const child of children) child.on('exit', (code) => stopAll(code ?? 0));
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
