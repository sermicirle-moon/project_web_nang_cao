export default function TaskDetail({ task, onClose, listNameDisplay }) {
  if (!task) return null;

  const detailTitle = task.title || task.Title;
  const detailDate = task.dueDate || task.DueDate;
  const detailCompleted = task.isCompleted || task.IsCompleted;
  const detailDescription = task.description || task.Description || "";

  return (
    <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
       <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <span className="text-[12px] font-bold text-slate-400 tracking-wider">DETAIL</span>
          <button onClick={onClose} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
             <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
       </div>
       
       <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          <textarea 
             className={`w-full text-[18px] font-bold text-slate-800 outline-none resize-none bg-transparent placeholder:text-slate-300 leading-snug ${detailCompleted ? 'line-through text-slate-400' : ''}`}
             defaultValue={detailTitle}
             rows={2}
             placeholder="Task name..."
          />
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-3 text-[13px] text-slate-600 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-blue-500">calendar_month</span>
              <span className="font-medium text-slate-700 flex-1">{detailDate ? new Date(detailDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Set Date'}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-slate-600 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-purple-500">folder</span>
              <span className="font-medium text-slate-700 flex-1">{listNameDisplay}</span>
            </div>
          </div>

          <div className="mt-6">
             <textarea 
                className="w-full text-[13px] text-slate-600 bg-slate-50 border border-transparent focus:border-blue-300 focus:bg-white rounded-lg p-3 outline-none resize-none transition-colors"
                placeholder="Description..."
                rows={8}
                defaultValue={detailDescription}
             />
          </div>
       </div>

       <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-[12px] text-slate-400">
          <button className="hover:text-slate-600 transition-colors"><span className="material-symbols-outlined text-[18px]">push_pin</span></button>
          <span>Created recently</span>
          <button className="hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
       </div>
    </div>
  );
}