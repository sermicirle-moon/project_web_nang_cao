import api from './api';

export const taskService = {

  getTasksByList: (listId) => api.get(`/taskitem/list/${listId}`),
  getTasksByFilter: (filterName) => api.get(`/taskitem/filter/${filterName}`),
  getTasksByTag: (tagId) => api.get(`/taskitem/tag/${tagId}`),
  getById: (id) => api.get(`/taskitem/${id}`),
  update: (id, data) => api.put(`/taskitem/${id}`, data),
  create: (data) => api.post('/taskitem', data),
  toggleComplete: (id) => api.patch(`/taskitem/${id}/complete`),
  delete: (id) => api.delete(`/taskitem/${id}`),
  hardDelete: (id) => api.delete(`/taskitem/${id}/hard`),
  emptyTrash: () => api.delete('/taskitem/trash/empty'),
  toggleWontDo: (id) => api.patch(`/taskitem/${id}/wontdo`),
  restore: (id) => api.patch(`/taskitem/${id}/restore`),
};