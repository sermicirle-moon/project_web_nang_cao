import axios from 'axios';

// Tạo một instance của axios với đường dẫn gốc tới Back-end của bạn
const api = axios.create({
    baseURL: 'http://localhost:5008/api', // Chú ý kiểm tra lại cổng 5008 cho chuẩn nhé
});

export default api;