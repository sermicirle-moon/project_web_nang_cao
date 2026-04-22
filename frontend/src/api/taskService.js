import api from './api';

export const taskService = {

  getTasksByList: (listId) => api.get(`/taskitem/list/${listId}`),
  getTasksByFilter: (filterName) => api.get(`/taskitem/filter/${filterName}`),
  
  create: (data) => api.post('/taskitem', data),
  toggleComplete: (id) => api.patch(`/taskitem/${id}/complete`),
  delete: (id) => api.delete(`/taskitem/${id}`),
};