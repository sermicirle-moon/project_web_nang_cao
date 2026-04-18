import api from './api'; 

export const tagService = {
  getAll: () => api.get('/tags'),
  create: (tagData) => api.post('/tags', tagData),
  update: (id, tagData) => api.put(`/tags/${id}`, tagData),
  delete: (id) => api.delete(`/tags/${id}`)
};