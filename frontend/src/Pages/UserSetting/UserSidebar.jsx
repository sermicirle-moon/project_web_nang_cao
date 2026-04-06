import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LandingPage from "../LandingPage/LandingPage";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();

  const getButtonClass = (id) => {
    const isActive = activeTab === id;
    return `w-full flex items-center gap-3 px-4 py-3 rounded-full font-bold transition-all ${
      isActive 
        ? 'bg-[#98f2d9] text-[#004d40] shadow-sm'
        : 'text-gray-500 hover:bg-[#cbf5eb] hover:text-gray-700'
    }`;
  };

  return (
    // Cái khung chứa toàn bộ Sidebar: Màu nền xanh ngọc, độ rộng 280px, chiếm toàn bộ chiều cao
    <aside className="w-[280px] bg-[#e3fbfa] h-full flex flex-col pt-10 px-6 border-r border-[#c2f0e9] shrink-0">
      
      {/* 1. PHẦN ĐẦU: TIÊU ĐỀ */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined">settings</span>
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg leading-tight">Profile Settings</h2>
          <p className="text-xs text-gray-500">Manage your digital workspace</p>
        </div>
      </div>

      {/* 2. PHẦN GIỮA: CÁC NÚT BẤM (Dùng flex-1 để nó đẩy phần cuối xuống đáy màn hình) */}
      <nav className="flex-1 space-y-2">
        <button onClick={() => setActiveTab('profile')} className={getButtonClass('profile')}>
          <span className="material-symbols-outlined text-[22px]">person</span> Account
        </button>
        
        <button onClick={() => setActiveTab('password')} className={getButtonClass('password')}>
          <span className="material-symbols-outlined text-[22px]">lock</span> Password
        </button>

      </nav>

      {/* 3. NÚT LOGOUT */}
      <div className="pb-8 space-y-4 mt-8">

        {/* Nút Đăng xuất */}
        <Link to="/" onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 transition-colors font-bold">
          <span className="material-symbols-outlined">logout</span> Logout
        </Link>
      </div>

    </aside>
  );
}