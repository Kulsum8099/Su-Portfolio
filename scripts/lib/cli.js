import readline from 'node:readline';
import { Writable } from 'node:stream';
import { stdin, stdout } from 'node:process';
import { connectToDatabase, describeConnectionError, disconnectFromDatabase } from '../../server/db.js';

// Prompts read from one readline interface. Lines are queued, so answers
// typed (or piped in) before a question is asked are never lost. Echo goes
// through a stream that can be muted, which hides typed passwords.
let rl = null;
let muted = false;
let closed = false;
const lines = [];
const waiting = [];

const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) stdout.write(chunk, encoding);
    callback();
  },
});

function start() {
  if (rl) return;
  rl = readline.createInterface({ input: stdin, output, terminal: Boolean(stdin.isTTY) });
  rl.on('line', (line) => {
    const clean = line.replace(/^\uFEFF/, ''); // Windows pipes may prepend a byte-order mark
    const next = waiting.shift();
    if (next) next.resolve(clean);
    else lines.push(clean);
  });
  rl.on('close', () => {
    closed = true;
    while (waiting.length) waiting.shift().reject(new Error('Input ended before all questions were answered.'));
  });
  rl.on('SIGINT', () => {
    stdout.write('\nCancelled.\n');
    process.exit(130);
  });
}

function nextLine() {
  start();
  if (lines.length) return Promise.resolve(lines.shift());
  if (closed) return Promise.reject(new Error('Input ended before all questions were answered.'));
  return new Promise((resolve, reject) => waiting.push({ resolve, reject }));
}

export function closePrompts() {
  rl?.close();
  rl = null;
}

// The question goes through readline's own prompt, so editing keys that
// redraw the line (e.g. Backspace) keep it on screen.
function showPrompt(question) {
  start();
  rl.setPrompt(question);
  rl.prompt();
}

export async function ask(question) {
  showPrompt(question);
  return (await nextLine()).trim();
}

/** Reads a line without showing what is typed (for passwords). */
export async function askHidden(question) {
  if (!stdin.isTTY) console.warn('(Input is not a terminal, so it cannot be hidden.)');
  showPrompt(question);
  muted = true;
  try {
    return await nextLine();
  } finally {
    muted = false;
    if (stdin.isTTY) stdout.write('\n');
  }
}

/** Connects, runs `task`, always cleans up, and sets a failing exit code on errors. */
export async function runWithDatabase(task) {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error(`\n✖ Could not connect to MongoDB.\n  ${describeConnectionError(error)}\n`);
    process.exitCode = 1;
    return;
  }
  try {
    await task();
  } catch (error) {
    console.error(`\n✖ ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    closePrompts();
    await disconnectFromDatabase();
  }
}
