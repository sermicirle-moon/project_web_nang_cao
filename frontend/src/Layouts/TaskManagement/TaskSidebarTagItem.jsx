export default function TaskSidebarTagItem({
  tag,
  editingTagId,
  editTagName,
  editTagColor,
  activeListId,
  activeMenuId,
  setActiveMenuId,
  onStartEdit,
  onEditNameChange,
  onEditColorChange,
  onSubmitEdit,
  onCancelEdit,
  onDelete,
  onSelectList,
  onPressStart,
  onPressEnd
}) {
  const tagMenuKey = `tag-${tag.id}`;
  const isEditing = editingTagId === tag.id;
  const isCurrentlyActive = activeListId === `tag-${tag.id}`;

  if (isEditing) {
    return (
      <form key={tagMenuKey} onSubmit={onSubmitEdit} className="mx-2 my-1 p-3 bg-white border border-blue-300 rounded-lg shadow-md z-20 relative">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[20px] shrink-0 transition-colors"
            style={{ color: editTagColor, fontVariationSettings: "'FILL' 1" }}
          >
            sell
          </span>
          <input
            autoFocus
            value={editTagName}
            onChange={onEditNameChange}
            className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 font-medium text-gray-800"
          />
        </div>
        <div className="flex gap-1.5 mb-3 items-center">
          {['#f87171', '#fb923c', '#4ade80', '#60a5fa', '#c084fc', '#f472b6', '#9ca3af'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onEditColorChange(color)}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
              style={{
                backgroundColor: color,
                borderColor: editTagColor === color ? '#3b82f6' : 'transparent',
                boxShadow: editTagColor === color ? 'inset 0 0 0 2px white' : 'none'
              }}
            />
          ))}
          <input
            type="color"
            value={editTagColor}
            onChange={(e) => onEditColorChange(e.target.value)}
            className="w-5 h-5 p-0 border-0 rounded cursor-pointer ml-1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1 text-xs font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!editTagName}
            className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Lưu
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      key={tagMenuKey}
      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group cursor-pointer ${
        isCurrentlyActive ? 'bg-[#e3f2fd] text-blue-700 shadow-sm font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium'
      }`}
      onMouseDown={() => onPressStart(tagMenuKey)}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={() => onPressStart(tagMenuKey)}
      onTouchEnd={onPressEnd}
      onClick={() => {
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(activeMenuId === tagMenuKey ? null : tagMenuKey);
          }}
          className="opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-sm text-gray-500 rounded-md p-1 transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
        {activeMenuId === tagMenuKey && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1.5 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(tag);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-500">edit</span> Sửa nhãn
            </button>
            <div className="h-px bg-gray-100 my-1 mx-2" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tag.id, tag.name);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span> Xóa nhãn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
