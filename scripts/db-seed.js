// Copies the built-in projects and profile (src/data) into MongoDB so the
// admin panel starts with the current site content.
//   npm run db:seed              # adds anything missing, never overwrites
//   npm run db:seed:force        # overwrites the seeded projects and profile
import { normalizeProfileInput, normalizeProjectInput } from '../shared/normalize.js';
import { Profile, Project } from '../server/models/index.js';
import { fallbackProfile } from '../src/data/profileData.js';
import { fallbackProjects } from '../src/data/projectsData.js';
import { runWithDatabase } from './lib/cli.js';

const force = process.argv.includes('--force');

await runWithDatabase(async () => {
  const counts = { created: 0, updated: 0, skipped: 0 };

  for (const [index, seed] of fallbackProjects.entries()) {
    const data = { ...normalizeProjectInput(seed), order: seed.order ?? index };
    const existing = await Project.findOne({ slug: data.slug });
    if (existing && !force) {
      counts.skipped += 1;
    } else if (existing) {
      existing.set(data);
      await existing.save();
      counts.updated += 1;
    } else {
      await Project.create(data);
      counts.created += 1;
    }
  }
  const hint = counts.skipped && !force ? ' (run npm run db:seed:force to overwrite them)' : '';
  console.log(
    `✔ Projects: ${counts.created} created, ${counts.updated} overwritten, ${counts.skipped} already existed${hint}.`,
  );

  const profile = await Profile.findOne({ key: 'main' });
  if (profile && !force) {
    console.log('✔ Profile: already exists (run npm run db:seed:force to overwrite it).');
  } else {
    const document = profile ?? new Profile({ key: 'main' });
    document.set(normalizeProfileInput(fallbackProfile));
    await document.save();
    console.log(`✔ Profile: ${profile ? 'overwritten' : 'created'}.`);
  }
});
