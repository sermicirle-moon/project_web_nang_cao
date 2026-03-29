import axios from 'axios';

// 1. Tạo "Trụ sở giao hàng" với địa chỉ gốc của Backend C#
const api = axios.create({
  baseURL: 'http://localhost:5008/api', // Nhớ giữ đúng cổng 5008 của bạn
});

// 2. Lập chốt kiểm tra (Interceptor) trước khi gửi API đi
api.interceptors.request.use(
  (config) => {
    // Lục trong ví (localStorage) xem có thẻ đăng nhập (token) không
    const token = localStorage.getItem('token'); 
    
    // Nếu có token, tự động dán vào thư gửi đi
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;