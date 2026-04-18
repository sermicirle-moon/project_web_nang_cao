import { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import { tagService } from '../../api/tagService';
import TaskSidebarNavItem from './TaskSidebarNavItem';
import TaskSidebarListForm from './TaskSidebarListForm';
import TaskSidebarTagForm from './TaskSidebarTagForm';
import TaskSidebarTagItem from './TaskSidebarTagItem';

const COLOR_OPTIONS = [
  '#f87171',
  '#fb923c',
  '#4ade80',
  '#60a5fa',
  '#c084fc',
  '#f472b6',
  '#9ca3af'
];

export default function ListManager({ activeListId, onSelectList }) {
  const [sidebarData, setSidebarData] = useState({ folders: [], standAloneLists: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [isListsExpanded, setIsListsExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListFolder, setNewListFolder] = useState('');
  const [newListColor, setNewListColor] = useState(COLOR_OPTIONS[3]);
  const [isSaving, setIsSaving] = useState(false);

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState('');
  const [editListFolder, setEditListFolder] = useState('');
  const [editListColor, setEditListColor] = useState(COLOR_OPTIONS[3]);

  const [tags, setTags] = useState([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[6]);
  const [isSavingTag, setIsSavingTag] = useState(false);

  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState(COLOR_OPTIONS[6]);

  const pressTimer = useRef(null);

  const fetchSidebarData = async () => {
    try {
      const response = await api.get('/tasklists/sidebar');
      const data = response.data;
      setSidebarData({ folders: data.folders || [], standAloneLists: data.standAloneLists || [] });
      const initialExpandedState = {};
      (data.folders || []).forEach((folder) => {
        initialExpandedState[folder.id] = true;
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
      alert('Lỗi cập nhật tag!');
    }
  };

  const handleDeleteTag = async (tagId, tagName) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhãn "${tagName}"?`)) {
      try {
        await tagService.delete(tagId);
        await fetchTags();
      } catch (error) {
        alert('Lỗi xóa tag!');
      }
    }
  };

  const handlePressStart = (menuKey) => {
    pressTimer.current = setTimeout(() => {
      setActiveMenuId(menuKey);
    }, 600);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

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

  const handleDeleteList = async (list) => {
    if (window.confirm(`Bạn có chắc muốn chuyển danh sách "${list.name}" vào thùng rác?`)) {
      try {
        await api.delete(`/tasklists/${list.id}`);
        await fetchSidebarData();
      } catch (error) {
        alert('Lỗi xóa danh sách!');
      }
    }
  };

  const startEditList = (list, currentFolderName) => {
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListFolder(currentFolderName || '');
    setEditListColor(list.color || COLOR_OPTIONS[3]);
    setActiveMenuId(null);
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

  const handleDeleteFolder = async (folder) => {
    if (folder.lists && folder.lists.length > 0) {
      alert(`❌ KHÔNG THỂ XÓA!\nThư mục "${folder.name}" đang chứa ${folder.lists.length} danh sách.\nVui lòng dọn sạch các danh sách ra ngoài trước khi xóa thư mục.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa thư mục "${folder.name}" không?`)) {
      try {
        await api.delete(`/taskfolders/${folder.id}`);
        await fetchSidebarData();
      } catch (error) {
        alert('Lỗi xóa thư mục!');
      }
    }
  };

  const submitEditFolder = async (folderId, oldName) => {
    if (!editFolderName.trim() || editFolderName === oldName) {
      setEditingFolderId(null);
      return;
    }

    try {
      await api.put(`/taskfolders/${folderId}`, { name: editFolderName });
      setEditingFolderId(null);
      await fetchSidebarData();
    } catch (error) {
      alert('Lỗi cập nhật thư mục!');
      setEditingFolderId(null);
    }
  };

  const renderNavItem = ({ list, currentFolderName, icon, isDot, color, label, count, showActions }) => {
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

    return (
      <TaskSidebarNavItem
        key={list ? `item-${list.id}` : `item-${label}`}
        list={list}
        label={label}
        icon={icon}
        color={color}
        isDot={isDot}
        count={count}
        activeListId={activeListId}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        onSelectList={onSelectList}
        showActions={showActions}
        currentFolderName={currentFolderName}
        onEdit={startEditList}
        onDelete={handleDeleteList}
      />
    );
  };

  return (
    <aside className="w-[280px] bg-[#fcfcfc] border-r border-gray-200 h-full flex flex-col py-5 shrink-0 z-10">
      <div className="px-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Bộ lọc thông minh</h3>
        <div className="space-y-1">
          {renderNavItem({ icon: 'inbox', color: 'text-blue-500', label: 'Hộp thư đến', count: 3 })}
          {renderNavItem({ icon: 'today', color: 'text-green-500', label: 'Hôm nay', count: 5 })}
          {renderNavItem({ icon: 'date_range', color: 'text-purple-500', label: '7 Ngày tới', count: 12 })}
        </div>
      </div>

      <div className="px-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Trạng thái</h3>
        <div className="space-y-1">
          {renderNavItem({ icon: 'task_alt', color: 'text-teal-500', label: 'Đã hoàn thành', count: 0 })}
          {renderNavItem({ icon: 'block', color: 'text-orange-400', label: 'Không làm', count: 0 })}
          {renderNavItem({ icon: 'delete', color: 'text-gray-400', label: 'Thùng rác', count: 0 })}
        </div>
      </div>

      <div className="px-3 flex-1 overflow-y-auto custom-scrollbar pb-20">
        <div className="flex items-center justify-between px-3 py-2 group text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => setIsListsExpanded(!isListsExpanded)}>
            <span className="material-symbols-outlined text-[18px] transition-transform">{isListsExpanded ? 'expand_more' : 'chevron_right'}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Danh sách</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsListsExpanded(true);
              setIsAddingList(true);
            }}
            className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-gray-200 hover:text-blue-600 rounded-md p-0.5 transition-all"
            title="Thêm danh sách"
          >
            add
          </button>
        </div>

        {isListsExpanded && (
          <div className="space-y-1 mt-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400 font-medium">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <>
                {sidebarData.standAloneLists.map((list) =>
                  renderNavItem({ list, currentFolderName: '', showActions: true, isDot: true, color: list.color, label: list.name })
                )}

                {sidebarData.folders.map((folder) => {
                  const folderMenuKey = `folder-${folder.id}`;
                  const isEditingThisFolder = editingFolderId === folderMenuKey;
                  const isFolderOpen = expandedFolders[folder.id];

                  return (
                    <div key={folderMenuKey} className="mt-4">
                      <div
                        className="group relative flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                        onClick={() => !isEditingThisFolder && toggleFolder(folder.id)}
                      >
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 uppercase tracking-wider flex-1">
                          <span className="material-symbols-outlined text-[18px] text-gray-400">{isFolderOpen ? 'expand_more' : 'chevron_right'}</span>
                          <span className="material-symbols-outlined text-[16px] text-gray-400">{isFolderOpen ? 'folder_open' : 'folder'}</span>
                          {isEditingThisFolder ? (
                            <input
                              autoFocus
                              value={editFolderName}
                              onChange={(e) => setEditFolderName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') submitEditFolder(folder.id, folder.name);
                                if (e.key === 'Escape') setEditingFolderId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => submitEditFolder(folder.id, folder.name)}
                              className="flex-1 min-w-0 bg-white border-2 border-blue-400 rounded-md px-2 py-0.5 text-[12px] text-gray-800 outline-none normal-case tracking-normal shadow-sm"
                            />
                          ) : (
                            <span className="truncate">{folder.name}</span>
                          )}
                        </div>

                        {!isEditingThisFolder && (
                          <div className="relative shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === folderMenuKey ? null : folderMenuKey);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:bg-white shadow-sm text-gray-500 rounded-md p-1 transition-all flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                            </button>
                            {activeMenuId === folderMenuKey && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1.5 overflow-hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingFolderId(folderMenuKey);
                                    setEditFolderName(folder.name);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[16px] text-blue-500">edit</span> Đổi tên
                                </button>
                                <div className="h-px bg-gray-100 my-1 mx-2" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span> Xóa thư mục
                                </button>
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
                  <TaskSidebarListForm
                    folders={sidebarData.folders}
                    colorOptions={COLOR_OPTIONS}
                    nameValue={newListName}
                    folderValue={newListFolder}
                    colorValue={newListColor}
                    onNameChange={(e) => setNewListName(e.target.value)}
                    onFolderChange={(e) => setNewListFolder(e.target.value)}
                    onColorChange={setNewListColor}
                    onCancel={() => setIsAddingList(false)}
                    onSave={handleSaveInline}
                    isSaving={isSaving}
                  />
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between px-3 py-2 group text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => setIsTagsExpanded(!isTagsExpanded)}>
            <span className="material-symbols-outlined text-[18px] transition-transform">{isTagsExpanded ? 'expand_more' : 'chevron_right'}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Nhãn dán</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTagsExpanded(true);
              setIsAddingTag(true);
            }}
            className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-gray-200 hover:text-blue-600 rounded-md p-0.5 transition-all"
            title="Thêm nhãn dán"
          >
            add
          </button>
        </div>

        {isTagsExpanded && (
          <div className="space-y-1 mt-1">
            {isAddingTag && (
              <TaskSidebarTagForm
                newTagName={newTagName}
                newTagColor={newTagColor}
                colorOptions={COLOR_OPTIONS}
                onNameChange={(e) => setNewTagName(e.target.value)}
                onColorChange={setNewTagColor}
                onCancel={() => setIsAddingTag(false)}
                onSubmit={handleSaveTag}
                isSaving={isSavingTag}
              />
            )}

            {tags.map((tag) => (
              <TaskSidebarTagItem
                key={`tag-${tag.id}`}
                tag={tag}
                editingTagId={editingTagId}
                editTagName={editTagName}
                editTagColor={editTagColor}
                activeListId={activeListId}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onStartEdit={startEditTag}
                onEditNameChange={(e) => setEditTagName(e.target.value)}
                onEditColorChange={setEditTagColor}
                onSubmitEdit={submitEditTag}
                onCancelEdit={() => setEditingTagId(null)}
                onDelete={handleDeleteTag}
                onSelectList={onSelectList}
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}