import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <div className="p-8">Vui lòng đăng nhập</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Hồ sơ của tôi</h1>
      <p><strong>Tên đầy đủ:</strong> {user.fullName}</p>
      <p><strong>Tên đăng nhập:</strong> {user.username}</p>
      <button onClick={logout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Đăng xuất</button>
    </div>
  );
}