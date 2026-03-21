import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Register() {
    // Gộp chung 4 trường dữ liệu cho giống với RegisterDto ở Back-end
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Công cụ dùng để chuyển trang bằng code
    const navigate = useNavigate();

    // Hàm cập nhật state khi người dùng gõ vào ô input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('Đang xử lý...');

        try {
            // Gọi API Đăng ký
            const response = await api.post('/auth/register', formData);
            
            setMessage('Đăng ký thành công! Đang chuyển hướng về trang Đăng nhập...');
            setIsSuccess(true);

            // Đợi 2 giây rồi tự động chuyển về trang Login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setIsSuccess(false);
            // Bắt lỗi từ Back-end trả về (ví dụ: Trùng username, mật khẩu yếu...)
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Tạo tài khoản Zentask</h2>
            
            {message && <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>}

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Họ và tên:</label>
                    <input 
                        type="text" name="fullName"
                        value={formData.fullName} onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Tài khoản:</label>
                    <input 
                        type="text" name="username"
                        value={formData.username} onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input 
                        type="email" name="email"
                        value={formData.email} onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu:</label>
                    <input 
                        type="password" name="password"
                        value={formData.password} onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required
                    />
                </div>

                <button type="submit" disabled={isSuccess} style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Đăng Ký
                </button>
            </form>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <p>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></p>
            </div>
        </div>
    );
}

export default Register;