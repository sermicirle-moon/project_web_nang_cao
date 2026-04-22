import { useState, useEffect } from "react";

export default function TaskInput({ listId, isReadOnlyView, onAddTask }) {
  const [title, setTitle] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState("date"); 

  const [priority, setPriority] = useState(0);
  const [isAllDay, setIsAllDay] = useState(false); // Nút Cả ngày
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  if (isReadOnlyView) return null;

  // Nếu chuyển về tab Hôm nay, ép nó về chế độ chọn 1 ngày (ẩn thời lượng)
  useEffect(() => {
    if (listId === "today" && dateMode === "duration") {
      setDateMode("date");
    }
  }, [listId, dateMode]);

  const priorityColors = {
    0: "text-slate-400",
    1: "text-blue-500",
    2: "text-orange-500",
    3: "text-red-500"
  };

  // Hàm build string ISO an toàn để gửi xuống C#
  const buildDateString = (dateStr, timeStr, allDay) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-');
    let hh = "00", mm = "00";
    if (!allDay && timeStr) {
      [hh, mm] = timeStr.split(':');
    }
    return `${y}-${m}-${d}T${hh}:${mm}:00`;
  };

  const handleSave = () => {
    if (!title.trim()) return;

    let defaultTargetDate = null;
    if (listId === "today" || listId === "next7days") {
      const today = new Date();
      // Format chuẩn YYYY-MM-DD
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      defaultTargetDate = `${yyyy}-${mm}-${dd}`;
    }

    let finalDueDate = buildDateString(dueDate || defaultTargetDate, dueTime, isAllDay);
    let finalStartDate = null;
    
    if (dateMode === "duration" && startDate) {
      finalStartDate = buildDateString(startDate, startTime, isAllDay);
    }

    onAddTask({
      title: title.trim(),
      startDate: finalStartDate,
      dueDate: finalDueDate,
      priority: priority
    });

    // Reset Form
    setTitle("");
    setStartDate("");
    setStartTime("");
    setDueDate("");
    setDueTime("");
    setPriority(0);
    setIsAllDay(false);
    setDateMode("date");
    setShowDatePicker(false);
    setShowPriorityMenu(false);
    setIsFocused(false);
  };

  return (
    <div className={`mb-8 transition-all duration-200 rounded-lg border ${
       isFocused ? 'border-blue-500 bg-white shadow-[0_2px_12px_rgba(59,130,246,0.1)] relative z-20' : 'border-transparent bg-slate-50 hover:bg-slate-100'
    }`}>
      
      <div className="flex items-center px-4">
        <span className={`material-symbols-outlined text-[20px] transition-colors ${isFocused ? 'text-blue-500' : 'text-slate-400'}`}>add</span>
        <input
          className="w-full px-3 py-3.5 outline-none text-slate-700 text-[14px] font-medium placeholder:text-slate-500 bg-transparent"
          placeholder="Thêm tác vụ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      </div>

      {isFocused && (
        <div className="px-4 py-2.5 flex justify-between items-center bg-white rounded-b-lg border-t border-slate-100">
          
          <div className="flex gap-1">
             <div className="relative">
                <button 
                  onClick={() => { setShowDatePicker(!showDatePicker); setShowPriorityMenu(false); }}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${showDatePicker || dueDate ? 'bg-blue-50 text-blue-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                  title="Thiết lập ngày"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </button>

                {showDatePicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowDatePicker(false)}></div>
                    <div className="absolute top-10 left-0 w-[290px] bg-white border border-slate-200 shadow-xl rounded-lg z-40 overflow-hidden">
                       
                       <div className="flex border-b border-slate-100 text-[12px] font-bold bg-slate-50">
                          <button 
                            className={`flex-1 py-2 text-center transition-colors ${dateMode === 'date' ? 'text-blue-600 bg-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setDateMode('date')}
                          >
                            Ngày hạn
                          </button>
                          {/* CHỈ HIỆN TAB THỜI LƯỢNG NẾU KHÔNG PHẢI LÀ 'HÔM NAY' */}
                          {listId !== 'today' && (
                            <button 
                              className={`flex-1 py-2 text-center transition-colors ${dateMode === 'duration' ? 'text-blue-600 bg-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`}
                              onClick={() => setDateMode('duration')}
                            >
                              Thời lượng
                            </button>
                          )}
                       </div>

                       <div className="p-4 flex flex-col gap-3">
                          {/* Nút All Day */}
                          <div className="flex items-center mb-1">
                            <label className="flex items-center gap-2 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-slate-800 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={isAllDay} 
                                onChange={(e) => setIsAllDay(e.target.checked)} 
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              Cả ngày
                            </label>
                          </div>

                          {dateMode === 'date' ? (
                             <div className="flex gap-2">
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[12px] outline-none focus:border-blue-400" />
                                {!isAllDay && (
                                   <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-[84px] bg-slate-50 border border-slate-200 rounded p-1.5 text-[12px] outline-none focus:border-blue-400" />
                                )}
                             </div>
                          ) : (
                             <>
                                <div className="flex items-center gap-2">
                                   <span className="text-[11px] font-bold text-slate-400 w-8">Từ</span>
                                   <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[12px] outline-none focus:border-blue-400" />
                                   {!isAllDay && <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-[80px] bg-slate-50 border border-slate-200 rounded p-1.5 text-[12px] outline-none focus:border-blue-400" />}
                                </div>
                                <div className="flex items-center gap-2">
                                   <span className="text-[11px] font-bold text-slate-400 w-8">Đến</span>
                                   <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[12px] outline-none focus:border-blue-400" />
                                   {!isAllDay && <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-[80px] bg-slate-50 border border-slate-200 rounded p-1.5 text-[12px] outline-none focus:border-blue-400" />}
                                </div>
                             </>
                          )}
                       </div>
                    </div>
                  </>
                )}
             </div>

             <div className="relative">
                <button 
                  onClick={() => { setShowPriorityMenu(!showPriorityMenu); setShowDatePicker(false); }}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-slate-100 ${priorityColors[priority]}`}
                  title="Mức độ ưu tiên"
                >
                  <span className="material-symbols-outlined text-[18px]" style={priority > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    flag
                  </span>
                </button>

                {showPriorityMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowPriorityMenu(false)}></div>
                    <div className="absolute top-10 left-0 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md p-1.5 flex gap-1 z-40">
                       {[0, 1, 2, 3].map((p) => (
                         <button
                           key={p}
                           onClick={() => { setPriority(p); setShowPriorityMenu(false); }}
                           className={`w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors ${priorityColors[p]}`}
                         >
                           <span className="material-symbols-outlined text-[18px]" style={p > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>
                             flag
                           </span>
                         </button>
                       ))}
                    </div>
                  </>
                )}
             </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <button onClick={() => setIsFocused(false)} className="px-3 py-1.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md transition-colors">Hủy</button>
            <button onClick={handleSave} className="px-5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-[13px] font-semibold shadow-sm transition-colors">Thêm</button>
          </div>
        </div>
      )}
    </div>
  );
}