export default function TaskDetail({ task, onClose, listNameDisplay }) {
  if (!task) return null;

  const detailTitle = task.title || task.Title;
  const detailDate = task.dueDate || task.DueDate;
  const detailCompleted = task.isCompleted || task.IsCompleted;
  const detailDescription = task.description || task.Description || "";
  
  // Lấy mảng subTasks từ dữ liệu task truyền vào (nếu không có thì để mảng rỗng)
  const subTasks = task.subTasks || task.SubTasks || [];

  return (
    <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
       <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <span className="text-[12px] font-bold text-slate-400 tracking-wider">CHI TIẾT</span>
          <button onClick={onClose} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
             <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
       </div>
       
       <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {/* TIÊU ĐỀ TASK */}
          <textarea 
             className={`w-full text-[18px] font-bold text-slate-800 outline-none resize-none bg-transparent placeholder:text-slate-300 leading-snug ${detailCompleted ? 'line-through text-slate-400' : ''}`}
             defaultValue={detailTitle}
             rows={2}
             placeholder="Tên công việc..."
          />
          
          {/* THÔNG TIN NGÀY VÀ DANH SÁCH */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-3 text-[13px] text-slate-600 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-blue-500">calendar_month</span>
              <span className="font-medium text-slate-700 flex-1">{detailDate ? new Date(detailDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Thiết lập ngày'}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-slate-600 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-purple-500">folder</span>
              <span className="font-medium text-slate-700 flex-1">{listNameDisplay}</span>
            </div>
          </div>

          {/* DANH SÁCH SUBTASKS (TÁC VỤ CON) */}
          <div className="mt-8 mb-4">
             <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tác vụ con</h4>
                <span className="text-[11px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{subTasks.length}</span>
             </div>
             
             <div className="space-y-1">
                {subTasks.map(st => {
                   const stCompleted = st.isCompleted || st.IsCompleted;
                   const stTitle = st.title || st.Title;
                   const stId = st.id || st.Id;

                   return (
                     <div key={stId} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 group transition-colors">
                        <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center transition-colors ${stCompleted ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                           {stCompleted && <span className="material-symbols-outlined text-[12px] font-bold text-white">check</span>}
                        </div>
                        <span className={`text-[13.5px] font-medium flex-1 truncate transition-colors ${stCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                           {stTitle}
                        </span>
                     </div>
                   )
                })}
                
                {subTasks.length === 0 && (
                   <p className="text-[12.5px] text-slate-400 italic px-2 py-1">Chưa có tác vụ con nào.</p>
                )}
             </div>
          </div>

          {/* MÔ TẢ (DESCRIPTION) */}
          <div className="mt-6">
             <textarea 
                className="w-full text-[13px] text-slate-600 bg-slate-50 border border-transparent focus:border-blue-300 focus:bg-white rounded-lg p-3 outline-none resize-none transition-colors custom-scrollbar"
                placeholder="Thêm mô tả..."
                rows={8}
                defaultValue={detailDescription}
             />
          </div>
       </div>

       {/* FOOTER */}
       <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-[12px] text-slate-400">
          <button className="hover:text-slate-600 transition-colors"><span className="material-symbols-outlined text-[18px]">push_pin</span></button>
          <span>Tạo gần đây</span>
          <button className="hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
       </div>
    </div>
  );
}