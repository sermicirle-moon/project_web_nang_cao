import api from './api';

export const habitService = {
  getAll: () => api.get('/habit'),
  create: (data) => api.post('/habit', data),
  log: (habitId, date, value, note) => api.post('/habit/log', { habitId, date, value, note }),
  quickLog: (habitId, date) => api.post('/habit/quick-log', { habitId, date }),
  deleteLog: (habitId, date) => api.delete(`/habit/log/${habitId}?date=${date}`),
  getStats: (habitId) => api.get(`/habit/${habitId}/stats`),
  getLogs: (habitId, days = 30) => api.get(`/habit/${habitId}/logs?days=${days}`),
  update: (id, data) => api.put(`/habit/${id}`, data),
  delete: (id) => api.delete(`/habit/${id}`)
};