// Admin endpoints. Every mutation clears the public content cache so the
// site's pages show the change on their next visit (no reload needed).
import { apiRequest } from '../lib/api';
import { invalidateResources } from '../lib/resource';

const mutate = async (request) => {
  const result = await request;
  invalidateResources();
  return result;
};

export const adminApi = {
  listProjects: () => apiRequest('/admin/projects').then((data) => data.projects),
  getProject: (id) => apiRequest(`/admin/projects/${id}`).then((data) => data.project),
  createProject: (project) =>
    mutate(apiRequest('/admin/projects', { method: 'POST', body: project })).then((data) => data.project),
  updateProject: (id, project) =>
    mutate(apiRequest(`/admin/projects/${id}`, { method: 'PUT', body: project })).then((data) => data.project),
  patchProject: (id, changes) =>
    mutate(apiRequest(`/admin/projects/${id}`, { method: 'PATCH', body: changes })).then((data) => data.project),
  deleteProject: (id) => mutate(apiRequest(`/admin/projects/${id}`, { method: 'DELETE' })),
  reorderProjects: (ids) => mutate(apiRequest('/admin/projects/order', { method: 'PUT', body: { ids } })),

  getProfile: () => apiRequest('/admin/profile').then((data) => data.profile),
  saveProfile: (profile) =>
    mutate(apiRequest('/admin/profile', { method: 'PUT', body: profile })).then((data) => data.profile),

  uploadImage: (blob, filename) =>
    apiRequest('/admin/uploads', {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': blob.type, 'X-File-Name': encodeURIComponent(filename) },
    }).then((data) => data.image),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),
};
