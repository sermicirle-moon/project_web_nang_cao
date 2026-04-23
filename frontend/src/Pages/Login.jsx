import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Button from '../Components/UI/button';
import person from '../assets/img/person.png'; 
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMessage('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!');
      setIsError(true);
      return;
    }

    setMessage('Đang xử lý...');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      const data = response.data;
      const userRole = data.roles?.[0] || 'User';
      
      login({
        token: data.token,
        role: userRole,
        fullName: data.fullName,
        username: username,
        avatarUrl: data.avatarUrl
      });
      
      setMessage(`Chào mừng ${data.fullName}! Đăng nhập thành công.`);
      setIsError(false);
      
      setTimeout(() => navigate('/features'), 1000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Illustration */}
        <div className="hidden md:block relative">
          <div className="bg-primary-container/20 rounded-2xl p-8">
            <img src={person} alt="Login illustration" className="w-full max-w-md mx-auto" />
          </div>
          <div className="mt-8 text-center">
            <h2 className="font-headline font-black text-3xl text-on-surface">TaskMaster Pro</h2>
            <p className="text-on-surface-variant mt-2">Access your profile and settings</p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl shadow-xl">
          <h1 className="font-headline font-black text-3xl text-on-surface text-center mb-6">Welcome Back</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Username */}
            <div>
              <label 
                htmlFor="login-username" 
                className="block font-body font-medium text-on-surface mb-2"
              >
                USERNAME
              </label>
              <input
                id="login-username"
                data-testid="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none transition"
              />
            </div>
            
            {/* Input Password */}
             <div>
              <label 
                htmlFor="login-password" 
                className="block font-body font-medium text-on-surface mb-2"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  data-testid="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary transition"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>


            {/* Message Display */}
            {message && (
              <div 
                id="login-message"
                data-testid="login-message"
                className={`p-3 rounded-xl text-center font-bold transition-all ${isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}
              >
                {message}
              </div>
            )}

            {/* Nút Submit */}
            <Button
              id="login-button"
              data-testid="login-button"
              type="submit"
              variant="primary"
              disabled={isLoading}
              className={`w-full justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'LOGIN'}
            </Button>

            {/* Phân cách */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container-low"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">OR</span>
              </div>
            </div>

            {/* Các nút đăng nhập bằng MXH */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                className="flex items-center justify-center gap-2 py-3 border-2 border-surface-container-low rounded-xl hover:bg-surface-container-low transition"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span className="font-body font-medium">Google</span>
              </button>
              <button 
                type="button" 
                className="flex items-center justify-center gap-2 py-3 border-2 border-surface-container-low rounded-xl hover:bg-surface-container-low transition"
              >
                <span className="material-symbols-outlined">apple</span>
                <span className="font-body font-medium">Apple</span>
              </button>
            </div>

            {/* Link Đăng ký */}
            <div className="text-center mt-6">
              <p className="text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" id="link-to-register" className="text-primary font-bold hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;