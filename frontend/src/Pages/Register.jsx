import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Button from '../Components/UI/button';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('Đang xử lý...');
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      setMessage('Đăng ký thành công! Đang chuyển hướng...');
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
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
            <div className="text-center">
              <h2 className="font-headline font-black text-3xl text-on-surface">Master Your Workflow with Precision</h2>
              <p className="text-on-surface-variant mt-4">Keep your business data secure and efficient. Design and manage workflows for teams.</p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl shadow-xl">
          <h1 className="font-headline font-black text-3xl text-on-surface text-center mb-6">Sign Up</h1>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block font-body font-medium text-on-surface mb-2">FULL NAME</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-body font-medium text-on-surface mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-body font-medium text-on-surface mb-2">USERNAME</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-body font-medium text-on-surface mb-2">PASSWORD</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-surface-container-low rounded-xl focus:border-primary focus:ring-0 outline-none"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-center ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full justify-center"
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : 'CREATE ACCOUNT'}
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
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;