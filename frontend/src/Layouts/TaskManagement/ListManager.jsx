import { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import { tagService } from '../../api/tagService';
import TaskSidebarNavItem from './TaskSidebarNavItem';
import TaskSidebarListForm from './TaskSidebarListForm';
import TaskSidebarTagForm from './TaskSidebarTagForm';
import TaskSidebarTagItem from './TaskSidebarTagItem';
import { useNavigate } from 'react-router-dom';

const COLOR_OPTIONS = [
  '#f87171', '#fb923c', '#4ade80', '#60a5fa', '#c084fc', '#f472b6', '#9ca3af'
];

export default function ListManager({ activeListId, onSelectList }) {
  const navigate = useNavigate(); 
  const [sidebarData, setSidebarData] = useState({ folders: [], standAloneLists: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Trạng thái thu gọn/mở rộng
  const [isListsExpanded, setIsListsExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);

  // Trạng thái thêm/sửa Danh sách
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListFolder, setNewListFolder] = useState('');
  const [newListColor, setNewListColor] = useState(COLOR_OPTIONS[3]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState('');
  const [editListFolder, setEditListFolder] = useState('');
  const [editListColor, setEditListColor] = useState(COLOR_OPTIONS[3]);

  // Trạng thái Thư mục
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');

  // Trạng thái Nhãn (Tags)
  const [tags, setTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[6]);
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState(COLOR_OPTIONS[6]);

  const pressTimer = useRef(null);

  // Lấy dữ liệu danh sách và thư mục
  const fetchSidebarData = async () => {
    try {
      const response = await api.get('/tasklists/sidebar');
      const data = response.data;
      setSidebarData({ folders: data.folders || [], standAloneLists: data.standAloneLists || [] });
      const initialExpandedState = {};
      (data.folders || []).forEach((folder) => { initialExpandedState[folder.id] = true; });
      setExpandedFolders(initialExpandedState);
    } catch (error) {
      console.error("Lỗi tải dữ liệu sidebar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy dữ liệu nhãn dán
  const fetchTags = async () => {
    try {
      const response = await tagService.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Lỗi tải tags', error);
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

  // --- LOGIC XỬ LÝ DANH SÁCH ---
  const handleSaveInline = async () => {
    if (!newListName.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/tasklists', {
        name: newListName,
        folderName: newListFolder.trim() || null,
        color: newListColor,
        icon: 'list'
      });
      setIsAddingList(false);
      setNewListName('');
      setNewListFolder('');
      await fetchSidebarData();
    } catch (error) {
      alert('Lỗi khi tạo danh sách!');
    } finally {
      setIsSaving(false);
    }
  };

  const submitEditList = async () => {
    if (!editListName.trim()) return;
    try {
      await api.put(`/tasklists/${editingListId}`, {
        name: editListName,
        folderName: editListFolder.trim() || null,
        color: editListColor,
        icon: 'list'
      });
      setEditingListId(null);
      await fetchSidebarData();
    } catch (error) {
      alert('Lỗi cập nhật danh sách!');
    }
  };

  // --- LOGIC XỬ LÝ NHÃN (TAG) ---
  const handleSaveTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsSavingTag(true);
    try {
      await tagService.create({ name: newTagName.trim(), color: newTagColor });
      setIsAddingTag(false);
      setNewTagName('');
      setNewTagColor(COLOR_OPTIONS[6]);
      await fetchTags();
    } catch (error) {
      alert('Lỗi khi tạo tag!');
    } finally {
      setIsSavingTag(false);
    }
  };

  const submitEditTag = async (e) => {
    e.preventDefault();
    if (!editTagName.trim()) return;
    try {
      await tagService.update(editingTagId, { name: editTagName.trim(), color: editTagColor });
      setEditingTagId(null);
      await fetchTags();
    } catch (error) {
      alert('Lỗi cập nhật tag!');
    }
  };

  // --- RENDER HELPERS ---
  const renderNavItem = ({ id, list, currentFolderName, icon, isDot, color, label, count, showActions }) => {
    if (list?.id === editingListId) {
      return (
        <TaskSidebarListForm
          key={`edit-list-${list.id}`}
          folders={sidebarData.folders}
          colorOptions={COLOR_OPTIONS}
          title="Chỉnh sửa danh sách"
          submitLabel="Cập nhật"
          nameValue={editListName}
          folderValue={editListFolder}
          colorValue={editListColor}
          onNameChange={(e) => setEditListName(e.target.value)}
          onFolderChange={(e) => setEditListFolder(e.target.value)}
          onColorChange={setEditListColor}
          onCancel={() => setEditingListId(null)}
          onSave={submitEditList}
          isSaving={isSaving}
        />
      );
    }

    const handleItemClick = (itemInfo) => {
      // Chuyển hướng URL cho các bộ lọc hoặc danh sách
      navigate(`/features/${itemInfo.id}`);
      if (onSelectList) onSelectList(itemInfo);
    };

    return (
      <TaskSidebarNavItem
        key={list ? `item-${list.id}` : `item-${id || label}`}
        id={id} 
        list={list}
        label={label}
        icon={icon}
        color={color}
        isDot={isDot}
        count={count}
        activeListId={activeListId}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        onSelectList={handleItemClick}
        showActions={showActions}
        currentFolderName={currentFolderName}
        onEdit={(lst, folder) => {
           setEditingListId(lst.id);
           setEditListName(lst.name);
           setEditListFolder(folder || '');
           setEditListColor(lst.color || COLOR_OPTIONS[3]);
           setActiveMenuId(null);
        }}
        onDelete={async (lst) => {
          if (window.confirm(`Xóa danh sách "${lst.name}"?`)) {
            await api.delete(`/tasklists/${lst.id}`);
            fetchSidebarData();
          }
        }}
      />
    );
  };

  return (
    <aside className="w-[280px] bg-[#fcfcfc] border-r border-gray-200 h-full flex flex-col py-5 shrink-0 z-10">
      {/* 1. Bộ lọc thông minh */}
      <div className="px-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Bộ lọc thông minh</h3>
        <div className="space-y-1">
          {renderNavItem({ id: 'inbox', icon: 'inbox', color: 'text-blue-500', label: 'Hộp thư đến' })}
          {renderNavItem({ id: 'today', icon: 'today', color: 'text-green-500', label: 'Hôm nay' })}
          {renderNavItem({ id: 'next7days', icon: 'date_range', color: 'text-purple-500', label: '7 Ngày tới' })}
        </div>
      </div>

      {/* 2. Trạng thái */}
      <div className="px-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Trạng thái</h3>
        <div className="space-y-1">
          {renderNavItem({ id: 'completed', icon: 'task_alt', color: 'text-teal-500', label: 'Đã hoàn thành' })}
          {renderNavItem({ id: 'blocked', icon: 'block', color: 'text-orange-400', label: 'Không làm' })}
          {renderNavItem({ id: 'trash', icon: 'delete', color: 'text-gray-400', label: 'Thùng rác' })}
        </div>
      </div>

      {/* 3. Danh sách tự tạo */}
      <div className="px-3 flex-1 overflow-y-auto custom-scrollbar pb-10">
        <div className="flex items-center justify-between px-3 py-2 group text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => setIsListsExpanded(!isListsExpanded)}>
            <span className="material-symbols-outlined text-[18px] transition-transform">{isListsExpanded ? 'expand_more' : 'chevron_right'}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Danh sách</span>
          </div>
          <button onClick={() => setIsAddingList(true)} className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all">add</button>
        </div>

        {isListsExpanded && (
          <div className="space-y-1 mt-1">
             {sidebarData.standAloneLists.map((list) => renderNavItem({ list, showActions: true, isDot: true, color: list.color, label: list.name }))}
             {sidebarData.folders.map((folder) => (
                <div key={folder.id} className="mt-2">
                   <div className="px-3 py-1 flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase">
                      <span className="material-symbols-outlined text-[16px]">folder</span> {folder.name}
                   </div>
                   <div className="ml-4 border-l border-gray-100 pl-2">
                      {folder.lists.map((list) => renderNavItem({ list, currentFolderName: folder.name, showActions: true, isDot: true, color: list.color, label: list.name }))}
                   </div>
                </div>
             ))}
             {isAddingList && (
               <TaskSidebarListForm
                 folders={sidebarData.folders} colorOptions={COLOR_OPTIONS}
                 nameValue={newListName} folderValue={newListFolder} colorValue={newListColor}
                 onNameChange={(e) => setNewListName(e.target.value)}
                 onFolderChange={(e) => setNewListFolder(e.target.value)}
                 onColorChange={setNewListColor} onCancel={() => setIsAddingList(false)}
                 onSave={handleSaveInline} isSaving={isSaving}
               />
             )}
          </div>
        )}

        {/* 4. Nhãn dán (Tags) */}
        <div className="mt-6 flex items-center justify-between px-3 py-2 group text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => setIsTagsExpanded(!isTagsExpanded)}>
            <span className="material-symbols-outlined text-[18px] transition-transform">{isTagsExpanded ? 'expand_more' : 'chevron_right'}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Nhãn dán</span>
          </div>
          <button onClick={() => setIsAddingTag(true)} className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all">add</button>
        </div>

        {isTagsExpanded && (
          <div className="space-y-1 mt-1">
            {isAddingTag && (
              <TaskSidebarTagForm
                newTagName={newTagName} newTagColor={newTagColor} colorOptions={COLOR_OPTIONS}
                onNameChange={(e) => setNewTagName(e.target.value)} onColorChange={setNewTagColor}
                onCancel={() => setIsAddingTag(false)} onSubmit={handleSaveTag} isSaving={isSavingTag}
              />
            )}
            {tags.map((tag) => (
              <TaskSidebarTagItem
                key={`tag-${tag.id}`}
                tag={tag} editingTagId={editingTagId} editTagName={editTagName} editTagColor={editTagColor}
                activeListId={activeListId} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId}
                onStartEdit={(t) => { setEditingTagId(t.id); setEditTagName(t.name); setEditTagColor(t.color); }}
                onEditNameChange={(e) => setEditTagName(e.target.value)} onEditColorChange={setEditTagColor}
                onSubmitEdit={submitEditTag} onCancelEdit={() => setEditingTagId(null)}
                onDelete={async (id, name) => { if(window.confirm(`Xóa nhãn "${name}"?`)) { await tagService.delete(id); fetchTags(); } }}
                onSelectList={(itemInfo) => {
                   // CHUYỂN HƯỚNG URL SANG DẠNG tag-ID
                   navigate(`/features/${itemInfo.id}`, { state: { name: itemInfo.name } }); 
                   if (onSelectList) onSelectList(itemInfo);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}