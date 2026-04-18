import { useState, useEffect, useRef } from 'react';
import api from '../../api/api'; 
import { tagService } from '../../api/tagService'; 

export default function ListManager({ activeListId, onSelectList }) {
  const [sidebarData, setSidebarData] = useState({ folders: [], standAloneLists: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Menu Chung
  const [activeMenuId, setActiveMenuId] = useState(null); 
  
  // ==================== BẢNG MÀU CHUẨN (MÃ HEX) ====================
  const colorOptions = [
    '#f87171', // Đỏ
    '#fb923c', // Cam
    '#4ade80', // Xanh lá
    '#60a5fa', // Xanh dương
    '#c084fc', // Tím
    '#f472b6', // Hồng
    '#9ca3af'  // Xám
  ];

  // ==================== STATE CHO LIST & FOLDER ====================
  const [isListsExpanded, setIsListsExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListFolder, setNewListFolder] = useState('');
  const [newListColor, setNewListColor] = useState(colorOptions[3]);
  const [isSaving, setIsSaving] = useState(false);

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState('');
  const [editListFolder, setEditListFolder] = useState('');
  const [editListColor, setEditListColor] = useState('');

  // ==================== STATE CHO TAGS ====================
  const [tags, setTags] = useState([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true); 
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(colorOptions[6]); // Mặc định Xám
  const [isSavingTag, setIsSavingTag] = useState(false);

  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('');

  const pressTimer = useRef(null);

  // ==================== FETCH DATA ====================
  const fetchSidebarData = async () => {
    try {
      const response = await api.get('/tasklists/sidebar'); 
      const data = response.data;
      setSidebarData({ folders: data.folders || [], standAloneLists: data.standAloneLists || [] });
      
      const initialExpandedState = {};
      (data.folders || []).forEach(f => {
        initialExpandedState[f.id] = true;
      });
      setExpandedFolders(initialExpandedState);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagService.getAll(); 
      setTags(response.data);
    } catch (error) {
      console.error("Lỗi tải tags", error);
    }
  };

  useEffect(() => { 
    fetchSidebarData(); 
    fetchTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ==================== LOGIC XỬ LÝ TAGS ====================
  const handleSaveTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    setIsSavingTag(true);
    try {
      await tagService.create({ name: newTagName.trim(), color: newTagColor });
      setIsAddingTag(false);
      setNewTagName('');
      setNewTagColor(colorOptions[6]); 
      await fetchTags(); 
    } catch (error) { 
      alert("Lỗi khi tạo Tag!"); 
    } finally { 
      setIsSavingTag(false); 
    }
  };

  const startEditTag = (tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
    setActiveMenuId(null);
  };

  const submitEditTag = async (e) => {
    e.preventDefault();
    if (!editTagName.trim()) return;
    try {
      await tagService.update(editingTagId, { name: editTagName.trim(), color: editTagColor });
      setEditingTagId(null);
      await fetchTags();
    } catch (error) {
      alert("Lỗi cập nhật Tag!");
    }
  };

  const handleDeleteTag = async (tagId, tagName) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhãn "${tagName}"?`)) {
      try { 
        await tagService.delete(tagId); 
        await fetchTags(); 
      } catch (error) { 
        alert("Lỗi xóa Tag!"); 
      }
    }
  };

  const handlePressStart = (menuKey) => {
    pressTimer.current = setTimeout(() => { setActiveMenuId(menuKey); }, 600); 
  };
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  // ==================== LOGIC FOLDER & LIST ====================
  const toggleFolder = (folderId) => { setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] })); };

  const handleSaveInline = async () => {
    if (!newListName.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/tasklists', { name: newListName, folderName: newListFolder.trim() || null, color: newListColor, icon: 'list' });
      setIsAddingList(false); setNewListName(''); setNewListFolder('');
      await fetchSidebarData(); 
    } catch (error) { alert("Lỗi!"); } finally { setIsSaving(false); }
  };

  const handleDeleteList = async (listId, listName) => {
    if (window.confirm(`Bạn có chắc muốn chuyển danh sách "${listName}" vào thùng rác?`)) {
      try { await api.delete(`/tasklists/${listId}`); await fetchSidebarData(); } catch (error) { alert("Lỗi!"); }
    }
  };

  const startEditList = (list, currentFolderName) => {
    setEditingListId(list.id); setEditListName(list.name); setEditListFolder(currentFolderName || ''); setEditListColor(list.color || colorOptions[3]); setActiveMenuId(null);
  };

  const submitEditList = async () => {
    if (!editListName.trim()) return;
    try {
      await api.put(`/tasklists/${editingListId}`, { name: editListName, folderName: editListFolder.trim() || null, color: editListColor, icon: 'list' });
      setEditingListId(null); await fetchSidebarData(); 
    } catch (error) { alert("Lỗi cập nhật!"); }
  };

  const handleDeleteFolder = async (folder) => {
    if (folder.lists && folder.lists.length > 0) {
      alert(`❌ KHÔNG THỂ XÓA!\nThư mục "${folder.name}" đang chứa ${folder.lists.length} danh sách.\nVui lòng dọn sạch các danh sách ra ngoài trước khi xóa thư mục.`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa thư mục "${folder.name}" không?`)) {
      try { await api.delete(`/taskfolders/${folder.id}`); await fetchSidebarData(); } catch (error) { alert("Lỗi!"); }
    }
  };

  const submitEditFolder = async (folderId, oldName) => {
    if (!editFolderName.trim() || editFolderName === oldName) { setEditingFolderId(null); return; }
    try { await api.put(`/taskfolders/${folderId}`, { name: editFolderName }); setEditingFolderId(null); await fetchSidebarData(); } catch (error) { alert("Lỗi cập nhật!"); setEditingFolderId(null); }
  };

  // ==================== ĐÃ SỬA LỖI MÀU: HELPER RENDER LIST ITEM ====================
  const renderNavItem = ({ list, currentFolderName, icon, isDot, color, label, count, active, showActions }) => {
    const menuKey = `list-${list?.id}`;
    const isCurrentlyActive = active || (list && activeListId === list.id) || (activeListId === label?.toLowerCase());
    const elementKey = list ? `item-${list.id}` : `item-${label}`;

    // Tự động nhận diện màu (Hex hay Tailwind Class cũ)
    const isHexColor = color?.startsWith('#');

    if (editingListId === list?.id) {
      return (
        <div key={elementKey} className="mx-2 my-1 p-3 bg-white border border-blue-300 rounded-lg shadow-md z-20 relative">
          <input autoFocus placeholder="Tên danh sách..." className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 mb-3 font-medium text-gray-800" value={editListName} onChange={(e) => setEditListName(e.target.value)} />
          <input list="folder-options" placeholder="Chọn/Nhập thư mục..." className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 mb-3" value={editListFolder} onChange={(e) => setEditListFolder(e.target.value)} />
          <datalist id="folder-options">{sidebarData.folders.map(f => <option key={f.id} value={f.name} />)}</datalist>
          
          <div className="flex gap-1.5 mb-3 items-center">
            {colorOptions.map(c => ( 
              <button 
                key={c} 
                type="button"
                onClick={() => setEditListColor(c)} 
                className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
                style={{ backgroundColor: c, borderColor: editListColor === c ? '#3b82f6' : 'transparent', boxShadow: editListColor === c ? 'inset 0 0 0 2px white' : 'none' }} 
              /> 
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setEditingListId(null)} className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1 text-xs font-medium transition-colors">Hủy</button>
            <button onClick={submitEditList} disabled={!editListName} className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">Lưu</button>
          </div>
        </div>
      );
    }

    return (
      <div key={elementKey} onClick={() => { if (onSelectList) onSelectList({ id: list ? list.id : label.toLowerCase(), name: label }); }} className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group cursor-pointer ${isCurrentlyActive ? 'bg-[#e3f2fd] text-blue-700 shadow-sm font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium'}`}>
        
        {isDot ? ( 
          <span 
            className={`w-2.5 h-2.5 rounded-full ml-0.5 shrink-0 transition-transform group-hover:scale-110 ${isHexColor ? '' : (color || 'bg-gray-400')}`} 
            style={isHexColor ? { backgroundColor: color } : {}}
          ></span> 
        ) : ( 
          <span 
            className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${isCurrentlyActive ? 'text-blue-600' : (isHexColor ? '' : color || 'text-gray-400')}`} 
            style={{ fontVariationSettings: "'FILL' 1", color: (!isCurrentlyActive && isHexColor) ? color : undefined }}
          >
            {icon}
          </span> 
        )}
        
        <span className="text-[14px] truncate flex-1 text-left">{label}</span>
        {count > 0 && activeMenuId !== menuKey && ( <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${isCurrentlyActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>{count}</span> )}
        
        {showActions && (
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === menuKey ? null : menuKey); }} className="opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-sm text-gray-500 rounded-md p-1 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">more_horiz</span></button>
            {activeMenuId === menuKey && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1.5 overflow-hidden">
                <button onClick={(e) => { e.stopPropagation(); startEditList(list, currentFolderName); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-[16px] text-blue-500">edit</span> Chỉnh sửa</button>
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id, list.name); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span> Xóa</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[280px] bg-[#fcfcfc] border-r border-gray-200 h-full flex flex-col py-5 shrink-0 z-10">
      
      {/* KHU VỰC 1 */}
      <div className="px-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Bộ lọc thông minh</h3>
        <div className="space-y-1">
          {/* MÀU ĐÃ TRỞ LẠI BÌNH THƯỜNG Ở ĐÂY */}
          {renderNavItem({ icon: "inbox", color: "text-blue-500", label: "Hộp thư đến", count: 3 })}
          {renderNavItem({ icon: "today", color: "text-green-500", label: "Hôm nay", count: 5 })}
          {renderNavItem({ icon: "date_range", color: "text-purple-500", label: "7 Ngày tới", count: 12 })}
        </div>
      </div>

      {/* KHU VỰC 2 */}
      <div className="px-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Trạng thái</h3>
        <div className="space-y-1">
          {/* MÀU ĐÃ TRỞ LẠI BÌNH THƯỜNG Ở ĐÂY */}
          {renderNavItem({ icon: "task_alt", color: "text-teal-500", label: "Đã hoàn thành", count: 0 })}
          {renderNavItem({ icon: "block", color: "text-orange-400", label: "Không làm", count: 0 })}
          {renderNavItem({ icon: "delete", color: "text-gray-400", label: "Thùng rác", count: 0 })}
        </div>
      </div>

      <div className="px-3 flex-1 overflow-y-auto custom-scrollbar pb-20">
        
        {/* ==================== DANH SÁCH & FOLDER ==================== */}
        <div className="flex items-center justify-between px-3 py-2 group text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => setIsListsExpanded(!isListsExpanded)}>
            <span className="material-symbols-outlined text-[18px] transition-transform">
              {isListsExpanded ? 'expand_more' : 'chevron_right'}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Danh sách</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsListsExpanded(true); setIsAddingList(true); }} className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-gray-200 hover:text-blue-600 rounded-md p-0.5 transition-all" title="Thêm danh sách">
            add
          </button>
        </div>
        
        {isListsExpanded && (
          <div className="space-y-1 mt-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                 <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-xs text-gray-400 font-medium">Đang tải dữ liệu...</span>
              </div>
            ) : (
               <>
                  {sidebarData.standAloneLists.map((list) => 
                    renderNavItem({ list, currentFolderName: "", showActions: true, isDot: true, color: list.color, label: list.name })
                  )}

                  {sidebarData.folders.map((folder) => {
                    const folderMenuKey = `folder-${folder.id}`; 
                    const isEditingThisFolder = editingFolderId === folderMenuKey;
                    const isFolderOpen = expandedFolders[folder.id]; 
                    
                    return (
                      <div key={folderMenuKey} className="mt-4">
                        <div className="group relative flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors" onClick={() => !isEditingThisFolder && toggleFolder(folder.id)}>
                          <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 uppercase tracking-wider flex-1">
                            <span className="material-symbols-outlined text-[18px] text-gray-400">{isFolderOpen ? 'expand_more' : 'chevron_right'}</span>
                            <span className="material-symbols-outlined text-[16px] text-gray-400">{isFolderOpen ? 'folder_open' : 'folder'}</span>
                            
                            {isEditingThisFolder ? (
                              <input 
                                autoFocus value={editFolderName} onChange={(e) => setEditFolderName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') submitEditFolder(folder.id, folder.name); if (e.key === 'Escape') setEditingFolderId(null); }}
                                onClick={(e) => e.stopPropagation()} onBlur={() => submitEditFolder(folder.id, folder.name)} 
                                className="flex-1 min-w-0 bg-white border-2 border-blue-400 rounded-md px-2 py-0.5 text-[12px] text-gray-800 outline-none normal-case tracking-normal shadow-sm"
                              />
                            ) : ( <span className="truncate">{folder.name}</span> )}
                          </div>
                          
                          {!isEditingThisFolder && (
                            <div className="relative shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === folderMenuKey ? null : folderMenuKey); }} className="opacity-0 group-hover:opacity-100 hover:bg-white shadow-sm text-gray-500 rounded-md p-1 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                              </button>
                              {activeMenuId === folderMenuKey && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1.5 overflow-hidden">
                                  <button onClick={(e) => { e.stopPropagation(); setEditingFolderId(folderMenuKey); setEditFolderName(folder.name); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-blue-500">edit</span> Đổi tên</button>
                                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">delete</span> Xóa thư mục</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {isFolderOpen && (
                          <div className="ml-3 space-y-1 mt-1 border-l-2 border-gray-100 pl-2">
                            {folder.lists.map((list) => 
                              renderNavItem({ list, currentFolderName: folder.name, showActions: true, isDot: true, color: list.color, label: list.name })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isAddingList && (
                    <div className="mx-2 mt-3 p-4 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl shadow-sm">
                      <input autoFocus placeholder="Tên danh sách..." className="w-full text-sm font-medium bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none pb-1.5 mb-4 transition-colors" value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                      <input list="folder-options" placeholder="Chọn/Nhập thư mục..." className="w-full text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4 transition-all" value={newListFolder} onChange={(e) => setNewListFolder(e.target.value)} />
                      <datalist id="folder-options">{sidebarData.folders.map(f => <option key={f.id} value={f.name} />)}</datalist>
                      <div className="flex gap-2 mb-4 items-center">
                        {colorOptions.map(c => (
                          <button 
                            key={c} 
                            type="button" 
                            onClick={() => setNewListColor(c)} 
                            className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
                            style={{ backgroundColor: c, borderColor: newListColor === c ? '#3b82f6' : 'transparent', boxShadow: newListColor === c ? 'inset 0 0 0 2px white' : 'none' }} 
                          />
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddingList(false)} className="text-gray-500 hover:bg-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors">Hủy</button>
                        <button type="button" onClick={handleSaveInline} disabled={isSaving || !newListName} className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-xs font-bold hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-blue-600">{isSaving ? '...' : 'Lưu'}</button>
                      </div>
                    </div>
                  )}
               </>
            )}
          </div>
        )}

        {/* ==================== NHÃN DÁN (TAGS) ==================== */}
        <div className="mt-4 flex items-center justify-between px-3 py-2 group text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => setIsTagsExpanded(!isTagsExpanded)}>
            <span className="material-symbols-outlined text-[18px] transition-transform">
              {isTagsExpanded ? 'expand_more' : 'chevron_right'}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Nhãn dán</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsTagsExpanded(true); setIsAddingTag(true); }} className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-gray-200 hover:text-blue-600 rounded-md p-0.5 transition-all" title="Thêm nhãn dán">
            add
          </button>
        </div>

        {isTagsExpanded && (
          <div className="space-y-1 mt-1">
            
            {/* Form Thêm Tag Mới */}
            {isAddingTag && (
              <form onSubmit={handleSaveTag} className="mx-2 mb-2 p-3 bg-white border border-blue-300 rounded-lg shadow-md z-20 relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[20px] shrink-0 transition-colors" style={{ color: newTagColor, fontVariationSettings: "'FILL' 1" }}>sell</span>
                  <input autoFocus placeholder="Tên nhãn..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 font-medium text-gray-800" />
                </div>
                <div className="flex gap-1.5 mb-3 items-center">
                  {colorOptions.map(c => ( 
                    <button 
                      key={c} 
                      type="button" 
                      onClick={() => setNewTagColor(c)} 
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
                      style={{ backgroundColor: c, borderColor: newTagColor === c ? '#3b82f6' : 'transparent', boxShadow: newTagColor === c ? 'inset 0 0 0 2px white' : 'none' }} 
                    /> 
                  ))}
                  <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-5 h-5 p-0 border-0 rounded cursor-pointer ml-1" title="Chọn màu tùy chỉnh" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingTag(false)} className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1 text-xs font-medium transition-colors">Hủy</button>
                  <button type="submit" disabled={isSavingTag || !newTagName} className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">Lưu</button>
                </div>
              </form>
            )}

            {/* Danh sách Tags */}
            {tags.map(tag => {
              const tagMenuKey = `tag-${tag.id}`;
              const isEditing = editingTagId === tag.id;
              const isCurrentlyActive = activeListId === `tag-${tag.id}`;

              if (isEditing) {
                return (
                  <form key={tagMenuKey} onSubmit={submitEditTag} className="mx-2 my-1 p-3 bg-white border border-blue-300 rounded-lg shadow-md z-20 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[20px] shrink-0 transition-colors" style={{ color: editTagColor, fontVariationSettings: "'FILL' 1" }}>sell</span>
                      <input autoFocus value={editTagName} onChange={(e) => setEditTagName(e.target.value)} className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 font-medium text-gray-800" />
                    </div>
                    <div className="flex gap-1.5 mb-3 items-center">
                      {colorOptions.map(c => ( 
                        <button 
                          key={c} 
                          type="button" 
                          onClick={() => setEditTagColor(c)} 
                          className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
                          style={{ backgroundColor: c, borderColor: editTagColor === c ? '#3b82f6' : 'transparent', boxShadow: editTagColor === c ? 'inset 0 0 0 2px white' : 'none' }} 
                        /> 
                      ))}
                      <input type="color" value={editTagColor} onChange={(e) => setEditTagColor(e.target.value)} className="w-5 h-5 p-0 border-0 rounded cursor-pointer ml-1" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingTagId(null)} className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1 text-xs font-medium transition-colors">Hủy</button>
                      <button type="submit" disabled={!editTagName} className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">Lưu</button>
                    </div>
                  </form>
                );
              }

              return (
                <div 
                  key={tagMenuKey} 
                  className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group cursor-pointer ${isCurrentlyActive ? 'bg-[#e3f2fd] text-blue-700 shadow-sm font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium'}`}
                  onMouseDown={() => handlePressStart(tagMenuKey)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(tagMenuKey)}
                  onTouchEnd={handlePressEnd}
                  onClick={(e) => {
                    if (activeMenuId !== tagMenuKey && onSelectList) {
                      onSelectList({ id: `tag-${tag.id}`, name: tag.name, type: 'tag' });
                    }
                  }}
                >
                  <span 
                    className="material-symbols-outlined text-[20px] shrink-0 transition-colors" 
                    style={{ color: isCurrentlyActive ? '#2563eb' : tag.color, fontVariationSettings: "'FILL' 1" }}
                  >
                    sell
                  </span>
                  
                  <span className="text-[14px] truncate flex-1 text-left">{tag.name}</span>

                  <div className="relative shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === tagMenuKey ? null : tagMenuKey); }} className="opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-sm text-gray-500 rounded-md p-1 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                    {activeMenuId === tagMenuKey && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1.5 overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); startEditTag(tag); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-blue-500">edit</span> Sửa nhãn
                        </button>
                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id, tag.name); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">delete</span> Xóa nhãn
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </aside>
  );
}