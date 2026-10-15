// Creates every collection and index the app relies on. Safe to re-run.
//   npm run db:init
import mongoose from 'mongoose';
import { IMAGE_BUCKET } from '../server/lib/images.js';
import { allModels } from '../server/models/index.js';
import { runWithDatabase } from './lib/cli.js';

const NAMESPACE_EXISTS = 48;

async function ensureCollection(name, create) {
  try {
    await create();
  } catch (error) {
    if (error?.code !== NAMESPACE_EXISTS) throw error;
  }
  return name;
}

await runWithDatabase(async () => {
  const db = mongoose.connection.db;

  for (const model of allModels) {
    const name = model.collection.collectionName;
    await ensureCollection(name, () => model.createCollection());
    await model.createIndexes();
    const indexes = Object.keys(await model.collection.indexInformation());
    console.log(`✔ ${name.padEnd(14)} indexes: ${indexes.join(', ')}`);
  }

  // GridFS bucket for uploaded images (the driver's standard indexes).
  const files = await ensureCollection(`${IMAGE_BUCKET}.files`, () => db.createCollection(`${IMAGE_BUCKET}.files`));
  const chunks = await ensureCollection(`${IMAGE_BUCKET}.chunks`, () => db.createCollection(`${IMAGE_BUCKET}.chunks`));
  await db.collection(files).createIndex({ filename: 1, uploadDate: 1 });
  await db.collection(chunks).createIndex({ files_id: 1, n: 1 }, { unique: true });
  console.log(`✔ ${IMAGE_BUCKET} (GridFS)  ready for image uploads`);

  console.log(`\nDatabase "${db.databaseName}" is ready.`);
});
