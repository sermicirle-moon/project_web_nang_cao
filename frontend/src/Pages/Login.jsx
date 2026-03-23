import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Button from '../Components/UI/button';
import person from '../assets/img/person.png'; // hoặc bất kỳ hình nào bạn có

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', userRole);
      setMessage(`Chào mừng ${data.fullName}! Đăng nhập thành công.`);
      setIsError(false);
      setTimeout(() => navigate('/'), 1000);
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
            <div>
              <label className="block font-body font-medium text-on-surface mb-2">EMAIL ADDRESS</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block font-body font-medium text-on-surface mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none transition"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full justify-center"
            >
              {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'LOGIN'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container-low"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">OR</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-surface-container-low rounded-xl hover:bg-surface-container-low transition">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span className="font-body font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-surface-container-low rounded-xl hover:bg-surface-container-low transition">
                <span className="material-symbols-outlined">apple</span>
                <span className="font-body font-medium">Apple</span>
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline">Create account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;