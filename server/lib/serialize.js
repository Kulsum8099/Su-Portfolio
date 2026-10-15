// Shapes database documents (from .lean() or .toObject()) for API responses.

export const PROJECT_SUMMARY_FIELDS =
  'slug title subtitle category accent summary coverImage technologies featured status order publishedAt updatedAt';

const without = (doc, keys) => {
  const copy = { ...doc };
  for (const key of keys) delete copy[key];
  return copy;
};

export function serializeProject(doc) {
  if (!doc) return null;
  return { id: String(doc._id), ...without(doc, ['_id', '__v']) };
}

export function serializeProfile(doc) {
  if (!doc) return null;
  return without(doc, ['_id', '__v', 'key']);
}

export const serializeAdmin = (admin) => ({
  id: String(admin._id),
  email: admin.email,
  name: admin.name || '',
  role: admin.role,
});
