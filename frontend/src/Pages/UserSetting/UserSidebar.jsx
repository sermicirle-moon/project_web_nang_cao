export default function Sidebar({ activeTab, setActiveTab }) {
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

        <button onClick={() => setActiveTab('premium')} className={getButtonClass('premium')}>
          <span className="material-symbols-outlined text-[22px]">workspace_premium</span> Premium
        </button>
      </nav>

      {/* 3. PHẦN CUỐI: KHUNG QUẢNG CÁO & NÚT LOGOUT */}
      <div className="pb-8 space-y-4 mt-8">
        
        {/* Banner quảng cáo Pro Plan */}
        <div className="bg-[#bdf3e8] p-5 rounded-2xl relative overflow-hidden">
          <h4 className="font-bold text-gray-800 mb-1 text-sm">Pro Plan Available</h4>
          <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
            Unlock advanced productivity bento grids and custom themes.
          </p>
          <button className="w-full bg-[#006054] text-white font-bold py-2 rounded-xl text-sm shadow-md hover:bg-[#004f44] transition-colors">
            Upgrade Now
          </button>
        </div>

        {/* Nút Đăng xuất */}
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 transition-colors font-bold">
          <span className="material-symbols-outlined">logout</span> Logout
        </button>
      </div>

    </aside>
  );
}