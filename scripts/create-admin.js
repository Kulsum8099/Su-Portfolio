// Creates an admin account, or resets an existing admin's password.
// There is deliberately no public sign-up: accounts only come from here.
//
//   Interactive:      npm run admin:create      (asks for email + password)
//   Reset password:   npm run admin:reset
//   Non-interactive:  set ADMIN_EMAIL and ADMIN_PASSWORD (optionally
//                     ADMIN_NAME) in the environment, then run either script.
import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH, passwordProblem } from '../shared/content.js';
import { hashPassword } from '../server/lib/password.js';
import { Admin, Session } from '../server/models/index.js';
import { ask, askHidden, runWithDatabase } from './lib/cli.js';

const reset = process.argv.includes('--reset');
const fromEnv = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

await runWithDatabase(async () => {
  const email = (process.env.ADMIN_EMAIL || (await ask('Admin email: '))).trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new Error('That does not look like a valid email address.');

  const existing = await Admin.findOne({ email });
  if (existing && !reset) {
    if (fromEnv) {
      throw new Error(`An admin with ${email} already exists. Run "npm run admin:reset" to set a new password.`);
    }
    const answer = await ask(`An admin with ${email} already exists. Reset its password? (y/N) `);
    if (!/^y(es)?$/i.test(answer)) {
      console.log('No changes made.');
      return;
    }
  }

  const name = existing
    ? existing.name
    : (process.env.ADMIN_NAME ?? (fromEnv ? '' : await ask('Display name (optional): '))).trim();

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await askHidden(`Password (at least ${PASSWORD_MIN_LENGTH} characters): `);
    const confirmation = await askHidden('Repeat the password: ');
    if (password !== confirmation) throw new Error('The passwords do not match. Nothing was saved.');
  }
  const problem = passwordProblem(password, email);
  if (problem) throw new Error(`Password rejected: ${problem}`);

  const passwordHash = await hashPassword(password);
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.passwordChangedAt = new Date();
    await existing.save();
    await Session.deleteMany({ admin: existing._id });
    console.log(`\n✔ Password updated for ${email}. All of its sessions were signed out.`);
  } else {
    await Admin.create({ email, name, passwordHash });
    console.log(`\n✔ Admin account created for ${email}.`);
  }

  console.log('  Sign in at /admin/login — locally: http://localhost:5173/admin/login');
  if (fromEnv) console.log('  Now remove ADMIN_PASSWORD from your environment variables.');
});
