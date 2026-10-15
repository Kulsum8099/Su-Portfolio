// Verifies the MongoDB connection and prints what the database contains.
//   npm run db:check
import mongoose from 'mongoose';
import { config } from '../server/config.js';
import { Admin, Profile, Project } from '../server/models/index.js';
import { runWithDatabase } from './lib/cli.js';

const redact = (uri) => uri.replace(/\/\/[^@/]+@/, '//<credentials>@');

console.log(`Connecting to ${config.mongoUri ? redact(config.mongoUri) : '(MONGODB_URI is not set)'} …`);

await runWithDatabase(async () => {
  const db = mongoose.connection.db;
  await db.command({ ping: 1 });
  const { version } = await db.command({ buildInfo: 1 }).catch(() => ({ version: 'unknown' }));
  const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
    .map((collection) => collection.name)
    .sort();
  const [projects, published, admins, profile] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: 'published' }),
    Admin.countDocuments(),
    Profile.exists({ key: 'main' }),
  ]);

  console.log(`\n✔ Connected to database "${db.databaseName}" (MongoDB ${version}).`);
  console.log(`  Collections: ${collections.join(', ') || '(none yet)'}`);
  console.log(`  Projects:    ${projects} total, ${published} published`);
  console.log(`  Profile:     ${profile ? 'saved' : 'not saved yet (the site uses the built-in profile)'}`);
  console.log(`  Admins:      ${admins}`);

  const next = [
    collections.length === 0 && 'npm run db:init      # create collections and indexes',
    projects === 0 && 'npm run db:seed      # import the starter projects and profile',
    admins === 0 && 'npm run admin:create # create your admin login',
  ].filter(Boolean);
  if (next.length) console.log(`\n  Next steps:\n    ${next.join('\n    ')}`);
  console.log('');
});
