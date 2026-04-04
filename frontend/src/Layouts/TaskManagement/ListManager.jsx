import { useState, useEffect } from 'react';
import api from '../../api'; 

export default function ListManager({ activeListId, onSelectList }) {
  const [sidebarData, setSidebarData] = useState({ folders: [], standAloneLists: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Thêm mới
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListFolder, setNewListFolder] = useState('');
  const [newListColor, setNewListColor] = useState('bg-blue-500');
  const [isSaving, setIsSaving] = useState(false);

  // Menu & Edit
  const [activeMenuId, setActiveMenuId] = useState(null); 
  
  // STATE SỬA FOLDER
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');

  // STATE SỬA FULL OPTION CHO LIST
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState('');
  const [editListFolder, setEditListFolder] = useState('');
  const [editListColor, setEditListColor] = useState('');

  const colorOptions = ['bg-red-400', 'bg-orange-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'];

  const fetchSidebarData = async () => {
    try {
      const response = await api.get('/tasklists/sidebar'); 
      setSidebarData({ folders: response.data.folders || [], standAloneLists: response.data.standAloneLists || [] });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSidebarData(); }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ==================== TẠO MỚI ====================
  const handleSaveInline = async () => {
    if (!newListName.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/tasklists', { name: newListName, folderName: newListFolder.trim() || null, color: newListColor, icon: 'list' });
      setIsAddingList(false); setNewListName(''); setNewListFolder('');
      await fetchSidebarData(); 
    } catch (error) {
      alert("Lỗi!");
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== SỬA / XÓA LIST ====================
  const handleDeleteList = async (listId, listName) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh sách "${listName}"?`)) {
      try {
        await api.delete(`/tasklists/${listId}`); 
        await fetchSidebarData(); 
      } catch (error) { alert("Lỗi!"); }
    }
  };

  const startEditList = (list, currentFolderName) => {
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListFolder(currentFolderName || ''); // Lấy tên folder hiện tại
    setEditListColor(list.color || 'bg-blue-500');
    setActiveMenuId(null);
  };

  const submitEditList = async () => {
    if (!editListName.trim()) return;
    try {
      await api.put(`/tasklists/${editingListId}`, { 
        name: editListName, 
        folderName: editListFolder.trim() || null, // Truyền Folder mới xuống C#
        color: editListColor, 
        icon: 'list' 
      });
      setEditingListId(null);
      await fetchSidebarData(); 
    } catch (error) { alert("Lỗi cập nhật!"); }
  };

  // ==================== SỬA / XÓA FOLDER ====================
  const handleDeleteFolder = async (folder) => {
    // TÍNH NĂNG CHẶN XÓA: BẢO VỆ DỮ LIỆU NGƯỜI DÙNG
    if (folder.lists && folder.lists.length > 0) {
      alert(`❌ KHÔNG THỂ XÓA!\nThư mục "${folder.name}" đang chứa ${folder.lists.length} danh sách.\nVui lòng dọn sạch các danh sách ra ngoài trước khi xóa thư mục.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa thư mục "${folder.name}" không?`)) {
      try {
        await api.delete(`/taskfolders/${folder.id}`); 
        await fetchSidebarData(); 
      } catch (error) { alert("Lỗi!"); }
    }
  };

  const submitEditFolder = async (folderId, oldName) => {
    if (!editFolderName.trim() || editFolderName === oldName) {
      setEditingFolderId(null); return;
    }
    try {
      await api.put(`/taskfolders/${folderId}`, { name: editFolderName });
      setEditingFolderId(null);
      await fetchSidebarData(); 
    } catch (error) { alert("Lỗi cập nhật!"); setEditingFolderId(null); }
  };


  // --- COMPONENT NAV ITEM ---
  const NavItem = ({ list, currentFolderName, icon, isDot, color, label, count, active, showActions }) => {
    const menuKey = `list-${list?.id}`;
    const isCurrentlyActive = active || (list && activeListId === list.id);

    // NẾU ĐANG BỊ EDIT -> HIỆN BẢNG FORM FULL OPTION
    if (editingListId === list?.id) {
      return (
        <div className="mx-2 my-1 p-3 bg-white border border-blue-300 rounded-lg shadow-md z-20 relative">
          <input autoFocus placeholder="Tên danh sách..." className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 mb-3 font-medium text-gray-800" value={editListName} onChange={(e) => setEditListName(e.target.value)} />
          <input list="folder-options" placeholder="Chọn/Nhập thư mục..." className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 mb-3" value={editListFolder} onChange={(e) => setEditListFolder(e.target.value)} />
          <datalist id="folder-options">{sidebarData.folders.map(f => <option key={f.id} value={f.name} />)}</datalist>
          
          <div className="flex gap-1.5 mb-3">
            {colorOptions.map(c => <button key={c} onClick={() => setEditListColor(c)} className={`w-4 h-4 rounded-full ${c} ${editListColor === c ? 'ring-2 ring-offset-1 ring-blue-400 shadow-sm' : ''}`} />)}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditingListId(null)} className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1 text-xs font-medium">Hủy</button>
            <button onClick={submitEditList} disabled={!editListName} className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600">Lưu</button>
          </div>
        </div>
      );
    }

    // HIỂN THỊ BÌNH THƯỜNG
    return (
      <div 
        onClick={() => { if (onSelectList) onSelectList({ id: list ? list.id : label.toLowerCase(), name: label }); }}
        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group cursor-pointer ${isCurrentlyActive ? 'bg-[#e6f0fa] text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        {isDot ? <span className={`w-2.5 h-2.5 rounded-full ${color || 'bg-gray-400'} ml-0.5 shrink-0`}></span> : <span className={`material-symbols-outlined text-[20px] shrink-0 ${isCurrentlyActive ? 'text-blue-600' : color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>}
        <span className="font-medium text-[14px] truncate flex-1 text-left">{label}</span>
        {count > 0 && activeMenuId !== menuKey && <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 shrink-0">{count}</span>}

        {showActions && (
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === menuKey ? null : menuKey); }} className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-500 rounded p-0.5 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">more_horiz</span>
            </button>
            {activeMenuId === menuKey && (
              <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-100 shadow-lg rounded-md z-50 py-1 overflow-hidden">
                <button onClick={(e) => { e.stopPropagation(); startEditList(list, currentFolderName); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">edit</span> Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id, list.name); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">delete</span> Xóa</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[260px] bg-[#fdfdfd] border-r border-gray-200 h-full flex flex-col py-3 shrink-0 z-10">
      <div className="px-2 space-y-0.5">
        <NavItem icon="inbox" color="text-blue-500" label="Hộp thư đến" count={3} />
        <NavItem icon="today" color="text-green-500" label="Hôm nay" count={5} />
        <NavItem icon="date_range" color="text-purple-500" label="7 Ngày tới" count={12} />
      </div>

      <hr className="mx-4 my-4 border-gray-200" />

      <div className="px-2 flex-1 overflow-y-auto custom-scrollbar pb-20">
        <div className="flex items-center justify-between px-3 py-1.5 group text-gray-400 hover:text-gray-600">
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
            <span className="text-xs font-bold uppercase tracking-wider">Danh sách</span>
          </div>
          <span onClick={() => setIsAddingList(true)} className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-gray-200 rounded p-0.5" title="Thêm danh sách">add</span>
        </div>
        
        <div className="space-y-0.5 mt-1">
          {isLoading ? <div className="text-center text-sm text-gray-400 py-2">Đang tải...</div> : (
             <>
                {sidebarData.standAloneLists.map((list) => (
                  <NavItem key={`list-${list.id}`} list={list} currentFolderName="" showActions isDot color={list.color} label={list.name} />
                ))}

                {sidebarData.folders.map((folder) => {
                  const folderMenuKey = `folder-${folder.id}`; 
                  const isEditingThisFolder = editingFolderId === folderMenuKey;
                  
                  return (
                    <div key={folderMenuKey} className="mt-2">
                      <div className="group relative flex items-center justify-between px-3 py-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">
                          <span className="material-symbols-outlined text-[14px]">folder</span>
                          
                          {isEditingThisFolder ? (
                            <input 
                              autoFocus value={editFolderName} onChange={(e) => setEditFolderName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') submitEditFolder(folder.id, folder.name); if (e.key === 'Escape') setEditingFolderId(null); }}
                              onClick={(e) => e.stopPropagation()} onBlur={() => submitEditFolder(folder.id, folder.name)} 
                              className="flex-1 min-w-0 bg-white border border-blue-400 rounded px-1 text-[12px] text-gray-800 outline-none normal-case tracking-normal"
                            />
                          ) : ( <span className="truncate">{folder.name}</span> )}
                        </div>
                        
                        {!isEditingThisFolder && (
                          <div className="relative shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === folderMenuKey ? null : folderMenuKey); }} className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-500 rounded p-0.5 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                            </button>
                            {activeMenuId === folderMenuKey && (
                              <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-100 shadow-lg rounded-md z-50 py-1 overflow-hidden">
                                <button onClick={(e) => { e.stopPropagation(); setEditingFolderId(folderMenuKey); setEditFolderName(folder.name); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">edit</span> Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">delete</span> Xóa</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ml-2 space-y-0.5 mt-0.5">
                        {folder.lists.map((list) => (
                          <NavItem key={`list-${list.id}`} list={list} currentFolderName={folder.name} showActions isDot color={list.color} label={list.name} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* THÊM LIST INLINE */}
                {isAddingList && (
                  <div className="mx-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                    <input autoFocus placeholder="Tên danh sách..." className="w-full text-sm bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none pb-1 mb-3" value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                    <input list="folder-options" placeholder="Chọn/Nhập thư mục..." className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 mb-3" value={newListFolder} onChange={(e) => setNewListFolder(e.target.value)} />
                    <datalist id="folder-options">{sidebarData.folders.map(f => <option key={f.id} value={f.name} />)}</datalist>
                    <div className="flex gap-1.5 mb-3">
                      {colorOptions.map(c => <button key={c} onClick={() => setNewListColor(c)} className={`w-4 h-4 rounded-full ${c} ${newListColor === c ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`} />)}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddingList(false)} className="text-gray-500 hover:bg-gray-200 rounded px-2 py-1 text-xs font-medium">Hủy</button>
                      <button onClick={handleSaveInline} disabled={isSaving || !newListName} className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600">{isSaving ? '...' : 'Lưu'}</button>
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