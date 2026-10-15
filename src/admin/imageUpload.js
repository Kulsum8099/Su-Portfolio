// Images are resized and re-encoded in the browser before upload, so the
// database stores web-ready files (≤ 2000px, WebP) and uploads stay small.

const MAX_DIMENSION = 2000;
const QUALITY = 0.86;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

export async function prepareImage(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose an image file (JPEG, PNG, WebP, GIF or AVIF).');
  if (file.type === 'image/svg+xml') throw new Error('SVG files are not supported. Export the image as PNG or WebP.');

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('This image could not be read. Try a JPEG, PNG or WebP file.');
  const { width, height } = bitmap;

  // GIFs may be animated, and canvas would keep only the first frame.
  if (file.type === 'image/gif') {
    bitmap.close();
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('GIFs must be 4 MB or smaller.');
    return { blob: file, width, height };
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Older Safari can't encode WebP and silently returns PNG; use JPEG then.
  let blob = await toBlob(canvas, 'image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg');
  if (!blob) throw new Error('This image could not be processed.');

  // Keep the original when it is already small and needs no resizing.
  if (scale === 1 && file.size <= blob.size && file.size <= MAX_UPLOAD_BYTES) {
    return { blob: file, width, height };
  }
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('This image is too large, even after compression.');
  return { blob, width: canvas.width, height: canvas.height };
}

/** Reads the pixel size of an image URL (for pasted links). */
export function measureImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('The image could not be loaded from that URL.'));
    image.src = url;
  });
}

/** "final-dashboard_v2.png" → "Final dashboard v2" (a starting point for alt text). */
export const altFromFilename = (name = '') => {
  const base = name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
};
