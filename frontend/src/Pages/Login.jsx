import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
    const navigate = useNavigate();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Tách riêng state để dễ quản lý màu sắc và trạng thái
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Thêm state loading để chặn spam click

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('Đang xử lý...');
        setIsError(false);
        setIsLoading(true); // Bắt đầu load thì khóa nút lại

        try {
            const response = await api.post('/auth/login', {
                username: username,
                password: password
            });

            const data = response.data;
            
            // Lấy role an toàn, tránh lỗi crash app nếu data.roles bị undefined
            const userRole = data.roles?.[0] || 'User'; 

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', userRole); 

            setMessage(`Chào mừng ${data.fullName}! Đăng nhập thành công với quyền ${userRole}.`);
            setIsError(false);

            // Chuyển hướng sang trang Dashboard sau 1 giây (hoặc chuyển luôn tùy bạn)
            setTimeout(() => {
                navigate('/LandingPage'); // Chuyển hướng đến trang chính sau khi đăng nhập thành công
            }, 1000);
            
        } catch (error) {
            setMessage(error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
            setIsError(true); // Đánh dấu là có lỗi để hiện màu đỏ
        } finally {
            setIsLoading(false); // Xong xuôi thì mở khóa nút
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Đăng Nhập Zentask</h2>
            
            {/* Hiển thị thông báo chuẩn logic hơn */}
            {message && (
                <p style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Tài khoản:</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu:</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>

                {/* Vô hiệu hóa nút (disabled) và đổi màu khi đang xử lý */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        background: isLoading ? '#6c757d' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isLoading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
            </div>
        </div>
    );
}

export default Login;