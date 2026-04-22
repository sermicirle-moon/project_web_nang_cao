import api from './api';

export const eisenhowerService = {
  getAll: () => api.get('/eisenhower'),
  create: (data) => api.post('/eisenhower', data),
  update: (id, data) => api.put(`/eisenhower/${id}`, data),
  delete: (id) => api.delete(`/eisenhower/${id}`)
};