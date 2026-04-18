export default function TaskSidebarTagForm({
  newTagName,
  newTagColor,
  colorOptions,
  onNameChange,
  onColorChange,
  onCancel,
  onSubmit,
  isSaving
}) {
  return (
    <form onSubmit={onSubmit} className="mx-2 mb-2 p-3 bg-white border border-blue-300 rounded-lg shadow-md z-20 relative">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="material-symbols-outlined text-[20px] shrink-0 transition-colors"
          style={{ color: newTagColor, fontVariationSettings: "'FILL' 1" }}
        >
          sell
        </span>
        <input
          autoFocus
          placeholder="Tên nhãn..."
          value={newTagName}
          onChange={onNameChange}
          className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 font-medium text-gray-800"
        />
      </div>
      <div className="flex gap-1.5 mb-3 items-center">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
            style={{
              backgroundColor: color,
              borderColor: newTagColor === color ? '#3b82f6' : 'transparent',
              boxShadow: newTagColor === color ? 'inset 0 0 0 2px white' : 'none'
            }}
          />
        ))}
        <input
          type="color"
          value={newTagColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-5 h-5 p-0 border-0 rounded cursor-pointer ml-1"
          title="Chọn màu tùy chỉnh"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1 text-xs font-medium transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSaving || !newTagName}
          className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          Lưu
        </button>
      </div>
    </form>
  );
}
