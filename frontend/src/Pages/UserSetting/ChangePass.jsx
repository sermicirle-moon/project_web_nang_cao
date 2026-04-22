import { useState } from 'react';
import { userService } from '../../api/userService';

export default function ChangePass() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('Vui lòng điền đầy đủ thông tin.');
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu mới và xác nhận không khớp.');
      setIsError(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(oldPassword, newPassword);
      setMessage('Đổi mật khẩu thành công!');
      setIsError(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      setMessage(msg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mật khẩu cũ */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary"
            >
              <span className="material-symbols-outlined">{showOld ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary"
            >
              <span className="material-symbols-outlined">{showNew ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary"
            >
              <span className="material-symbols-outlined">{showConfirm ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-center font-bold ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dim transition disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
}