export default function TaskSidebarNavItem({
  id, // 1. Bổ sung tham số id
  list,
  label,
  icon,
  color,
  isDot,
  count,
  activeListId,
  activeMenuId,
  setActiveMenuId,
  onSelectList,
  showActions,
  currentFolderName,
  onEdit,
  onDelete
}) {
  const menuKey = `list-${list?.id}`;
  
  // 2. Chốt ID chuẩn: Nếu là list thật thì lấy list.id, nếu là Bộ lọc thì lấy id truyền vào
  const itemKey = list ? list.id : (id || label?.toLowerCase());
  
  // 3. So sánh chuẩn xác
  const isCurrentlyActive = activeListId === itemKey;
  const isHexColor = color?.startsWith('#');

  return (
    <div
      onClick={() => {
        // 4. Truyền ID chuẩn lên trên
        if (onSelectList) onSelectList({ id: itemKey, name: label });
      }}
      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group cursor-pointer ${
        isCurrentlyActive
          ? 'bg-[#e3f2fd] text-blue-700 shadow-sm font-semibold'
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium'
      }`}
    >
      {/* ... Phần giao diện bên dưới giữ nguyên y hệt của bạn ... */}
      {isDot ? (
        <span
          className={`w-2.5 h-2.5 rounded-full ml-0.5 shrink-0 transition-transform group-hover:scale-110 ${
            isHexColor ? '' : color || 'bg-gray-400'
          }`}
          style={isHexColor ? { backgroundColor: color } : {}}
        />
      ) : (
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
            isCurrentlyActive ? 'text-blue-600' : isHexColor ? '' : color || 'text-gray-400'
          }`}
          style={{ fontVariationSettings: "'FILL' 1", color: !isCurrentlyActive && isHexColor ? color : undefined }}
        >
          {icon}
        </span>
      )}

      <span className="text-[14px] truncate flex-1 text-left">{label}</span>

      {count > 0 && activeMenuId !== menuKey && (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
            isCurrentlyActive
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
          }`}
        >
          {count}
        </span>
      )}

      {showActions && (
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === menuKey ? null : menuKey);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-sm text-gray-500 rounded-md p-1 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
          {activeMenuId === menuKey && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1.5 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(list, currentFolderName);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-500">edit</span> Chỉnh sửa
              </button>
              <div className="h-px bg-gray-100 my-1 mx-2" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(list);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
