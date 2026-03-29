import { useState, useEffect } from 'react';
import api from '../../api'; 

export default function ListManager() {
  const [sidebarData, setSidebarData] = useState({ folders: [], standAloneLists: [] });
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE CHO CHẾ ĐỘ THÊM INLINE ---
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListFolder, setNewListFolder] = useState('');
  const [newListColor, setNewListColor] = useState('bg-blue-500');
  const [isSaving, setIsSaving] = useState(false);

  const colorOptions = ['bg-red-400', 'bg-orange-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'];

  // ========================================================
  // 1. HÀM LẤY DỮ LIỆU (Đã được nâng cấp bằng Axios)
  // ========================================================
  const fetchSidebarData = async () => {
    try {
      // Chỉ cần gọi /tasklists/sidebar. api.js sẽ tự ghép URL và nhét Token
      const response = await api.get('/tasklists/sidebar'); 
      
      // Axios tự động parse JSON, dữ liệu nằm ngay trong response.data
      const data = response.data; 
      setSidebarData({ folders: data.folders || [], standAloneLists: data.standAloneLists || [] });
    } catch (error) {
      console.error("Lỗi khi lấy Menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSidebarData(); }, []);

  const handleCancel = () => {
    setIsAddingList(false);
    setNewListName('');
    setNewListFolder('');
  };

  // ========================================================
  // 2. HÀM LƯU DANH SÁCH MỚI (Đã được nâng cấp bằng Axios)
  // ========================================================
  const handleSaveInline = async () => {
    if (!newListName.trim()) return;

    setIsSaving(true);
    try {
      // Gọi API siêu ngắn gọn
      await api.post('/tasklists', {
        name: newListName,
        folderName: newListFolder.trim() || null,
        color: newListColor,
        icon: 'list'
      });

      // Nếu API chạy thành công (mã 200) thì nó mới chạy xuống 2 dòng này
      handleCancel(); 
      await fetchSidebarData(); 
      
    } catch (error) {
      // Nếu lỗi 401 hoặc 400, Axios văng thẳng vào đây
      console.error("Lỗi lưu:", error);
      alert("Không thể tạo danh sách. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  // --- COMPONENT CON (GIAO DIỆN TỪNG MỤC) ---
  const NavItem = ({ icon, isDot, color, label, count, active }) => (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${active ? 'bg-[#e6f0fa] text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}>
      {isDot ? (
        <span className={`w-2.5 h-2.5 rounded-full ${color || 'bg-gray-400'} ml-0.5`}></span>
      ) : (
        <span className={`material-symbols-outlined text-[20px] ${active ? 'text-blue-600' : color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      )}
      <span className="font-medium text-[14px] truncate">{label}</span>
      {count > 0 && <span className="ml-auto text-xs font-semibold text-gray-400 group-hover:text-gray-600">{count}</span>}
    </button>
  );

  return (
    <aside className="w-[260px] bg-[#fdfdfd] border-r border-gray-200 h-full flex flex-col py-3 shrink-0 z-10">
      <div className="px-2 space-y-0.5">
        <NavItem icon="inbox" color="text-blue-500" label="Hộp thư đến" count={3} />
        <NavItem icon="today" color="text-green-500" label="Hôm nay" count={5} />
        <NavItem icon="date_range" color="text-purple-500" label="7 Ngày tới" count={12} />
      </div>

      <hr className="mx-4 my-4 border-gray-200" />

      <div className="px-2 flex-1 overflow-y-auto custom-scrollbar">
        {/* Nút cộng thêm List */}
        <div className="flex items-center justify-between px-3 py-1.5 group text-gray-400 hover:text-gray-600">
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
            <span className="text-xs font-bold uppercase tracking-wider">Danh sách</span>
          </div>
          <span 
            onClick={() => setIsAddingList(true)}
            className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-gray-200 rounded p-0.5"
            title="Thêm danh sách"
          >
            add
          </span>
        </div>
        
        <div className="space-y-0.5 mt-1">
          {isLoading ? (
             <div className="text-center text-sm text-gray-400 py-2">Đang tải...</div>
          ) : (
             <>
                {sidebarData.standAloneLists.map((list) => (
                  <NavItem key={`list-${list.id}`} isDot color={list.color} label={list.name} />
                ))}

                {sidebarData.folders.map((folder) => (
                  <div key={`folder-${folder.id}`} className="mt-2">
                    <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">folder</span>
                      {folder.name}
                    </div>
                    <div className="ml-2 space-y-0.5">
                      {folder.lists.map((list) => (
                        <NavItem key={`list-${list.id}`} isDot color={list.color} label={list.name} />
                      ))}
                    </div>
                  </div>
                ))}

                {/* --- KHU VỰC NHẬP INLINE KHI BẤM DẤU + --- */}
                {isAddingList && (
                  <div className="mx-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                    <input 
                      autoFocus
                      placeholder="Tên danh sách..."
                      className="w-full text-sm bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none pb-1 mb-3"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                    
                    <input 
                      list="folder-options"
                      placeholder="Chọn/Nhập thư mục..."
                      className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 mb-3"
                      value={newListFolder}
                      onChange={(e) => setNewListFolder(e.target.value)}
                    />
                    <datalist id="folder-options">
                      {sidebarData.folders.map(f => (
                        <option key={f.id} value={f.name} />
                      ))}
                    </datalist>

                    <div className="flex gap-1.5 mb-3">
                      {colorOptions.map(c => (
                        <button key={c} onClick={() => setNewListColor(c)} className={`w-4 h-4 rounded-full ${c} ${newListColor === c ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`} />
                      ))}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button onClick={handleCancel} className="text-gray-500 hover:bg-gray-200 rounded px-2 py-1 text-xs font-medium">Hủy</button>
                      <button 
                        onClick={handleSaveInline} 
                        disabled={isSaving || !newListName}
                        className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isSaving ? '...' : 'Lưu'}
                      </button>
                    </div>
                  </div>
                )}
             </>
          )}
        </div>
      </div>
    </aside>
  );
}