import api from './api';

export const userService = {
  // Đổi mật khẩu
  changePassword: (oldPassword, newPassword) => 
    api.post('/user/change-password', { oldPassword, newPassword }),
  
  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};