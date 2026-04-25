import { useState, useEffect } from "react";
import { taskService } from "../../../api/taskService"; 
import api from "../../../api/api"; 

const PRIORITY_COLORS = {
  0: "text-slate-400 hover:bg-slate-100",
  1: "text-blue-500 hover:bg-blue-50",
  2: "text-orange-500 hover:bg-orange-50",
  3: "text-red-500 hover:bg-red-50"
};

export default function TaskDetail({ task, onClose, listNameDisplay, availableLists, onTaskUpdated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false); 

  // CÁC STATE CHO QUẢN LÝ NGÀY THÁNG
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState("date"); 
  const [isAllDay, setIsAllDay] = useState(false); 
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || task.Title || "");
      setDescription(task.description || task.Description || "");
      setPriority(task.priority || task.Priority || 0);
      
      const tStart = task.startDate || task.StartDate;
      const tDue = task.dueDate || task.DueDate;

      const parseDateTime = (dStr) => {
        if (!dStr) return { d: "", t: "" };
        const d = new Date(dStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return { d: `${y}-${m}-${day}`, t: `${hh}:${mm}` };
      };

      const pStart = parseDateTime(tStart);
      const pDue = parseDateTime(tDue);

      setStartDate(pStart.d);
      setStartTime(pStart.t === "00:00" ? "" : pStart.t);
      setDueDate(pDue.d);
      setDueTime(pDue.t === "00:00" ? "" : pDue.t);

      if (tStart && tDue && tStart !== tDue) {
        setDateMode("duration");
      } else {
        setDateMode("date");
      }

      if ((!pStart.t || pStart.t === "00:00") && (!pDue.t || pDue.t === "00:00")) {
        setIsAllDay(true);
      } else {
        setIsAllDay(false);
      }
    }
  }, [task]);

  if (!task) return null;

  const taskId = task.id || task.Id;
  const isCompleted = task.isCompleted || task.IsCompleted;
  const subTasks = task.subTasks || task.SubTasks || [];

  const currentListId = task.taskListId !== undefined ? task.taskListId : task.TaskListId;
  let currentFolderName = "Hộp thư đến";
  if (currentListId && availableLists) {
      const foundList = availableLists.find(l => l.id === currentListId);
      if (foundList) currentFolderName = foundList.name;
  }

  const handleUpdateComplex = async (updates) => {
    const payload = {
      title: title,
      description: description,
      priority: priority,
      dueDate: task.dueDate || task.DueDate,
      startDate: task.startDate || task.StartDate,
      isCompleted: isCompleted,
      taskListId: currentListId,
      parentTaskId: task.parentTaskId !== undefined ? task.parentTaskId : task.ParentTaskId,
      tagIds: (task.tags || task.Tags || []).map(t => t.id || t.Id),
      ...updates
    };

    try {
      await taskService.update(taskId, payload);
      if (onTaskUpdated) onTaskUpdated(taskId); 
    } catch (err) {
      alert("Lỗi khi cập nhật tác vụ.");
    }
  };

  const handleUpdate = (field, value) => {
    const currentValue = task[field] !== undefined ? task[field] : task[field.charAt(0).toUpperCase() + field.slice(1)];
    if (currentValue === value) return;
    handleUpdateComplex({ [field]: value });
  };

  const handleMoveTask = async (targetListId) => {
    try {
        await api.patch(`/taskitem/${taskId}/move`, { taskListId: targetListId });
        setShowFolderMenu(false);
        if (onTaskUpdated) onTaskUpdated(taskId); 
    } catch (err) {
        alert("Lỗi khi chuyển danh sách.");
    }
  };

  // KẾT HỢP DỮ LIỆU ĐỂ LƯU XUỐNG DB
  const buildDateString = (dateStr, timeStr, allDay) => {
    if (!dateStr) return null;
    let hh = "00", mm = "00";
    if (!allDay && timeStr) {
      [hh, mm] = timeStr.split(':');
    }
    return `${dateStr}T${hh}:${mm}:00`;
  };

  // HÀM LƯU LỊCH VÀO DATABASE KHI NHẤN "XÁC NHẬN"
  const confirmDateChange = () => {
    const finalDue = buildDateString(dueDate, dueTime, isAllDay);
    let finalStart = null;
    if (dateMode === "duration" && startDate) {
      finalStart = buildDateString(startDate, startTime, isAllDay);
    }
    handleUpdateComplex({ dueDate: finalDue, startDate: finalStart });
    setShowDatePicker(false);
  };

  const clearDate = () => {
    setDueDate(""); setStartDate(""); setDueTime(""); setStartTime("");
    handleUpdateComplex({ dueDate: null, startDate: null });
    setShowDatePicker(false);
  };

  // ✅ LOGIC MỚI: HIỂN THỊ CHÍNH XÁC KÈM THEO GIỜ, PHÚT VÀ THỜI LƯỢNG LÊN NÚT BẤM
  const displayDateText = () => {
    if (!dueDate && !startDate) return 'Thiết lập ngày';

    const formatDisplay = (dStr, tStr) => {
        if (!dStr) return '';
        const [, m, d] = dStr.split('-');
        let result = `${d} Thg ${m}`;
        if (!isAllDay && tStr) {
            result += ` ${tStr}`; // Nối thêm giờ phút nếu không phải "Cả ngày"
        }
        return result;
    };

    if (dateMode === 'duration' && startDate && dueDate) {
        return `${formatDisplay(startDate, startTime)} - ${formatDisplay(dueDate, dueTime)}`;
    }
    
    return formatDisplay(dueDate, dueTime) || 'Thiết lập ngày';
  };

  const handleToggleComplete = async () => {
    try {
      await taskService.toggleComplete(taskId);
      if (onTaskUpdated) onTaskUpdated(taskId);
    } catch (err) { alert("Lỗi cập nhật trạng thái"); }
  };

  const handleDelete = async () => {
    if (window.confirm("Đưa tác vụ này vào thùng rác?")) {
      try {
        await taskService.delete(taskId);
        if (onTaskUpdated) onTaskUpdated(null); 
      } catch (err) { alert("Lỗi xóa"); }
    }
  };

  return (
    <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200 shadow-xl">
       <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
             <button onClick={handleToggleComplete} className={`w-5 h-5 rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors ${isCompleted ? 'bg-blue-500 border-blue-500' : 'border-slate-400 hover:bg-slate-50'}`}>
                {isCompleted && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
             </button>
             <span className="text-[12px] font-bold text-slate-400 tracking-wider">CHI TIẾT</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
             <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
       </div>
       
       <div className="p-5 overflow-y-auto custom-scrollbar flex-1 pb-20">
          <textarea 
             className={`w-full text-[18px] font-bold text-slate-800 outline-none resize-none bg-transparent placeholder:text-slate-300 leading-snug transition-colors border-b border-transparent focus:border-blue-200 pb-1 ${isCompleted ? 'line-through text-slate-400' : ''}`}
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             onBlur={(e) => handleUpdate('title', e.target.value)}
             onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
             rows={2}
             placeholder="Tên công việc..."
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            
            {/* ✅ NÚT VÀ POPUP CHỌN NGÀY THÁNG ĐA DẠNG */}
            <div className="relative group">
              <button 
                onClick={() => { setShowDatePicker(!showDatePicker); setShowPriorityMenu(false); setShowFolderMenu(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors ${dueDate || startDate ? 'bg-blue-50/50 border-blue-200 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span className="text-[12px] font-medium">{displayDateText()}</span>
              </button>

              {showDatePicker && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowDatePicker(false)}></div>
                  <div className="absolute top-full mt-1 left-0 w-[300px] bg-white border border-slate-200 shadow-xl rounded-lg z-40 overflow-hidden">
                     <div className="flex border-b border-slate-100 text-[12px] font-bold bg-slate-50">
                        <button 
                          className={`flex-1 py-2 text-center transition-colors ${dateMode === 'date' ? 'text-blue-600 bg-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`}
                          onClick={() => { setDateMode('date'); setStartDate(""); setStartTime(""); }} // Xóa Start Date khi về Ngày đơn
                        >
                          Ngày hạn
                        </button>
                        <button 
                          className={`flex-1 py-2 text-center transition-colors ${dateMode === 'duration' ? 'text-blue-600 bg-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`}
                          onClick={() => setDateMode('duration')}
                        >
                          Thời lượng
                        </button>
                     </div>

                     <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center mb-1">
                          <label className="flex items-center gap-2 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-slate-800 transition-colors">
                            <input 
                              type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} 
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            Cả ngày
                          </label>
                        </div>

                        {dateMode === 'date' ? (
                           <div className="flex gap-2">
                              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[13px] outline-none focus:border-blue-400" />
                              {!isAllDay && <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-[90px] bg-slate-50 border border-slate-200 rounded p-1.5 text-[13px] outline-none focus:border-blue-400" />}
                           </div>
                        ) : (
                           <>
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-bold text-slate-400 w-8 text-right">Từ</span>
                                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[13px] outline-none focus:border-blue-400" />
                                 {!isAllDay && <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-[85px] bg-slate-50 border border-slate-200 rounded p-1.5 text-[13px] outline-none focus:border-blue-400" />}
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-bold text-slate-400 w-8 text-right">Đến</span>
                                 <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[13px] outline-none focus:border-blue-400" />
                                 {!isAllDay && <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-[85px] bg-slate-50 border border-slate-200 rounded p-1.5 text-[13px] outline-none focus:border-blue-400" />}
                              </div>
                           </>
                        )}

                        <div className="flex justify-end gap-2 mt-2">
                           <button onClick={clearDate} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-[12px] font-semibold transition-colors">
                              Xóa
                           </button>
                           <button onClick={confirmDateChange} className="px-3 py-1.5 bg-blue-500 text-white rounded text-[12px] font-semibold hover:bg-blue-600 transition-colors shadow-sm">
                              Xác nhận
                           </button>
                        </div>
                     </div>
                  </div>
                </>
              )}
            </div>

            {/* MỨC ĐỘ ƯU TIÊN */}
            <div className="relative">
              <button 
                onClick={() => { setShowPriorityMenu(!showPriorityMenu); setShowDatePicker(false); setShowFolderMenu(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors ${PRIORITY_COLORS[priority]}`}
              >
                <span className="material-symbols-outlined text-[16px]" style={priority > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>flag</span>
                <span className="text-[12px] font-medium">Ưu tiên {priority === 0 ? '' : priority}</span>
              </button>
              
              {showPriorityMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowPriorityMenu(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 shadow-xl rounded-md p-1.5 flex flex-col gap-1 z-40 w-32">
                      {[3, 2, 1, 0].map((p) => (
                        <button
                          key={p}
                          onClick={() => { setPriority(p); setShowPriorityMenu(false); handleUpdate('priority', p); }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded text-[12px] font-medium transition-colors ${PRIORITY_COLORS[p]}`}
                        >
                          <span className="material-symbols-outlined text-[16px]" style={p > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>flag</span>
                          {p === 0 ? 'Bình thường' : `Mức ${p}`}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>

            {/* NÚT CHUYỂN LIST (FOLDER) */}
            <div className="relative">
              <button 
                onClick={() => { setShowFolderMenu(!showFolderMenu); setShowDatePicker(false); setShowPriorityMenu(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors ${showFolderMenu ? 'bg-blue-50/50 border-blue-200 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <span className="material-symbols-outlined text-[16px]">folder</span>
                <span className="text-[12px] font-medium">{currentFolderName}</span>
              </button>
              
              {showFolderMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowFolderMenu(false)}></div>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-100 shadow-xl rounded-md py-1.5 flex flex-col z-40 max-h-60 overflow-y-auto custom-scrollbar">
                      <button 
                          onClick={() => handleMoveTask(null)} 
                          className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-blue-50 flex items-center gap-2 ${currentListId === null ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                      >
                          <span className="material-symbols-outlined text-[16px]">inbox</span> Hộp thư đến
                      </button>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      {availableLists?.map(l => (
                          <button 
                              key={l.id} 
                              onClick={() => handleMoveTask(l.id)} 
                              className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-slate-50 flex items-center gap-2 ${currentListId === l.id ? 'bg-slate-50 text-slate-900' : 'text-slate-600'}`}
                          >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color || '#cbd5e1' }}></span>
                              <span className="truncate">{l.name}</span>
                          </button>
                      ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* DANH SÁCH SUBTASKS */}
          {subTasks.length > 0 && (
             <div className="mt-8 mb-4">
                <div className="flex items-center justify-between mb-3 px-1">
                   <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tác vụ con</h4>
                   <span className="text-[11px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{subTasks.length}</span>
                </div>
                <div className="space-y-1">
                   {subTasks.map(st => {
                      const stCompleted = st.isCompleted || st.IsCompleted;
                      return (
                        <div key={st.id || st.Id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 group transition-colors cursor-default">
                           <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center transition-colors ${stCompleted ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                              {stCompleted && <span className="material-symbols-outlined text-[12px] font-bold text-white">check</span>}
                           </div>
                           <span className={`text-[13px] font-medium flex-1 truncate transition-colors ${stCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {st.title || st.Title}
                           </span>
                        </div>
                      )
                   })}
                </div>
             </div>
          )}

          {/* DESCRIPTION */}
          <div className="mt-8">
             <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Mô tả</h4>
             <textarea 
                className="w-full text-[13.5px] text-slate-700 bg-slate-50 border border-transparent focus:border-blue-300 focus:bg-white focus:shadow-sm rounded-lg p-3 outline-none resize-none transition-all custom-scrollbar placeholder:text-slate-400"
                placeholder="Thêm chi tiết cho công việc..."
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={(e) => handleUpdate('description', e.target.value)}
             />
          </div>
       </div>

       {/* FOOTER */}
       <div className="absolute bottom-0 left-0 w-full px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-[12px] text-slate-400 z-20">
          <button className="hover:text-slate-600 transition-colors flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100" title="Ghim lên đầu">
             <span className="material-symbols-outlined text-[18px]">push_pin</span>
          </button>
          
          <span>Đã lưu tự động</span>
          
          <button onClick={handleDelete} className="hover:text-rose-600 transition-colors flex items-center justify-center w-8 h-8 rounded hover:bg-rose-50 text-slate-400" title="Xóa tác vụ">
             <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
       </div>
    </div>
  );
}