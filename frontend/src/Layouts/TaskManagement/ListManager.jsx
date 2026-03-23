export default function ListManager() {
  const NavItem = ({ icon, isDot, color, label, count, active }) => (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${active ? 'bg-[#e6f0fa] text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}>
      {isDot ? (
        <span className={`w-2.5 h-2.5 rounded-full ${color} ml-0.5`}></span>
      ) : (
        <span className={`material-symbols-outlined text-[20px] ${active ? 'text-blue-600' : color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      )}
      <span className="font-medium text-[14px]">{label}</span>
      {count > 0 && (
        <span className={`ml-auto text-xs font-semibold ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    // w-[260px] - Chiều rộng chuẩn của TickTick Menu
    <aside className="w-[260px] bg-[#fdfdfd] border-r border-gray-200 h-full flex flex-col py-3 shrink-0 z-10">
      
      <div className="px-2 space-y-0.5">
        <NavItem icon="inbox" color="text-blue-500" label="Hộp thư đến" count={3} />
        <NavItem icon="today" color="text-green-500" label="Hôm nay" count={5} active={true} />
        <NavItem icon="date_range" color="text-purple-500" label="7 Ngày tới" count={12} />
      </div>

      <hr className="mx-4 my-4 border-gray-200" />

      <div className="px-2 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-3 py-1.5 group cursor-pointer text-gray-400 hover:text-gray-600">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
            <span className="text-xs font-bold uppercase tracking-wider">Danh sách</span>
          </div>
          <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100">add</span>
        </div>
        
        <div className="space-y-0.5 mt-1">
          <NavItem isDot color="bg-red-400" label="Công việc Zentask" count={2} />
          <NavItem isDot color="bg-blue-400" label="Học tập" count={8} />
        </div>
      </div>
    </aside>
  );
}