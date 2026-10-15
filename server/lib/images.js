// Uploaded images live in MongoDB GridFS (bucket "images"), so the project
// needs no extra storage service. Files are immutable: replacing an image
// uploads a new file, and unreferenced files are cleaned up automatically.
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';

export const IMAGE_BUCKET = 'images';
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
// Ids are 128 random bits rather than ObjectIds: ObjectIds are partly
// predictable, which would let someone guess the URLs of images that only
// unpublished drafts use.
export const IMAGE_ID_PATTERN = /^[a-f0-9]{32}$/;
const IMAGE_URL_PATTERN = /^\/api\/images\/([a-f0-9]{32})$/;
const ABANDONED_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Identifies an image from its first bytes instead of trusting the client's
 * Content-Type. SVG is intentionally unsupported (it can carry script).
 */
export function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  const ascii = (start, end) => buffer.subarray(start, end).toString('latin1');
  if (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a') return 'image/gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'image/avif';
  return null;
}

/** Returns the file id for URLs that point at an uploaded image, else null. */
export function uploadedImageId(url) {
  const match = typeof url === 'string' ? IMAGE_URL_PATTERN.exec(url) : null;
  return match ? match[1] : null;
}

const bucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: IMAGE_BUCKET });
const filesCollection = () => mongoose.connection.db.collection(`${IMAGE_BUCKET}.files`);

export async function saveImage(buffer, { contentType, filename, uploadedBy }) {
  const id = randomBytes(16).toString('hex');
  const stream = bucket().openUploadStreamWithId(id, filename || 'image', {
    metadata: { contentType, uploadedBy },
  });
  await new Promise((resolve, reject) => {
    stream.once('finish', resolve);
    stream.once('error', reject);
    stream.end(buffer);
  });
  return id;
}

export const findImage = (id) => filesCollection().findOne({ _id: id });

export const openImageStream = (id) => bucket().openDownloadStream(id);

async function deleteImage(id) {
  try {
    await bucket().delete(id);
  } catch (error) {
    // Already gone is fine; anything else is worth knowing about.
    if (!/FileNotFound|not found/i.test(error?.message ?? '')) throw error;
  }
}

/**
 * Deletes uploaded images among `urls` that no document references anymore.
 * `isReferenced(url)` is supplied by the caller so this module stays free of
 * model imports.
 */
export async function releaseImages(urls, isReferenced) {
  const ids = [...new Set(urls.map(uploadedImageId).filter(Boolean))];
  for (const id of ids) {
    if (!(await isReferenced(`/api/images/${id}`))) await deleteImage(id);
  }
}

/** Removes uploads that were never saved into any document (e.g. a cancelled edit). */
export async function sweepAbandonedUploads(isReferenced) {
  const cutoff = new Date(Date.now() - ABANDONED_AFTER_MS);
  const stale = await filesCollection()
    .find({ uploadDate: { $lt: cutoff } }, { projection: { _id: 1 } })
    .limit(200)
    .toArray();
  for (const { _id } of stale) {
    if (!(await isReferenced(`/api/images/${_id}`))) await deleteImage(String(_id));
  }
}
