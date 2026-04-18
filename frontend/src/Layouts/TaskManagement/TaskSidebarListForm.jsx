import { useState, useEffect, useRef } from 'react';

export default function TaskSidebarListForm({
  folders,
  colorOptions,
  title = 'Thêm danh sách',
  submitLabel = 'Lưu',
  nameValue,
  folderValue,
  colorValue,
  onNameChange,
  onFolderChange,
  onColorChange,
  onCancel,
  onSave,
  isSaving
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mx-2 mt-3 p-4 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl shadow-sm">
      <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>
      <input
        autoFocus
        placeholder="Tên danh sách..."
        className="w-full text-sm font-medium bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none pb-1.5 mb-4 transition-colors"
        value={nameValue}
        onChange={onNameChange}
      />
      <div className="relative mb-4" ref={dropdownRef}>
        <input
          list="folder-options"
          placeholder="Chọn/Nhập thư mục..."
          className="w-full text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-10 transition-all"
          value={folderValue}
          onChange={onFolderChange}
        />
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onFolderChange({ target: { value: '' } });
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 text-gray-600"
            >
              Không có thư mục (độc lập)
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => {
                  onFolderChange({ target: { value: folder.name } });
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 text-gray-600"
              >
                {folder.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <datalist id="folder-options">
        {folders.map((folder) => (
          <option key={folder.id} value={folder.name} />
        ))}
      </datalist>
      <div className="flex gap-2 mb-4 items-center">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
            style={{
              backgroundColor: color,
              borderColor: colorValue === color ? '#3b82f6' : 'transparent',
              boxShadow: colorValue === color ? 'inset 0 0 0 2px white' : 'none'
            }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:bg-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !nameValue}
          className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-xs font-bold hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          {isSaving ? '...' : submitLabel}
        </button>
      </div>
    </div>
  );
}

