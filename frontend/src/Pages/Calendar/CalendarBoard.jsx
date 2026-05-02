import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; 
import timeGridPlugin from "@fullcalendar/timegrid"; 
import interactionPlugin from "@fullcalendar/interaction";
import { taskService } from "../../api/taskService"; 

export default function MainCalendar() {
  const [events, setEvents] = useState([]);
  const [rawTasks, setRawTasks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Quản lý "Chế độ tạo đè" (Ghosting Mode)
  const [isCreationMode, setIsCreationMode] = useState(false);

  const [modal, setModal] = useState({
      isOpen: false,
      mode: 'create', 
      id: null,
      title: '',
      type: 0,
      isAllDay: true,
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      originalTask: null
  });

  const addDaysSafe = (dateString, days) => {
      const datePart = dateString.split('T')[0]; 
      const [y, m, d] = datePart.split('-');
      const dateObj = new Date(y, m - 1, d); 
      dateObj.setDate(dateObj.getDate() + days);
      const newY = dateObj.getFullYear();
      const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
      const newD = String(dateObj.getDate()).padStart(2, '0');
      return `${newY}-${newM}-${newD}`;
  };

  const splitMultiDayEvent = (task) => {
      let tStartStr = task.startDate || task.StartDate;
      let tDueStr = task.dueDate || task.DueDate;
      if (!tStartStr || !tDueStr) return null;

      const isAllDay = tStartStr.includes("00:00:00") && tDueStr.includes("00:00:00");
      const startDatePart = tStartStr.split('T')[0];
      const dueDatePart = tDueStr.split('T')[0];

      if (isAllDay || startDatePart === dueDatePart) return null;

      const splitEvents = [];
      const [sy, sm, sd] = startDatePart.split('-');
      const [ey, em, ed] = dueDatePart.split('-');
      let currentDay = new Date(sy, sm - 1, sd);
      const endDayObj = new Date(ey, em - 1, ed);

      const timeStart = tStartStr.split('T')[1];
      const timeEnd = tDueStr.split('T')[1];

      while (currentDay <= endDayObj) {
          const y = currentDay.getFullYear();
          const m = String(currentDay.getMonth() + 1).padStart(2, '0');
          const d = String(currentDay.getDate()).padStart(2, '0');
          const dayStr = `${y}-${m}-${d}`;

          splitEvents.push({
              id: `${task.id || task.Id}-${dayStr}`,
              title: task.title || task.Title,
              start: `${dayStr}T${timeStart}`,
              end: `${dayStr}T${timeEnd}`,
              allDay: false,
              backgroundColor: "#6366f1", 
              borderColor: "#6366f1",
              extendedProps: { ...task, isSplit: true, originalId: task.id || task.Id }
          });
          currentDay.setDate(currentDay.getDate() + 1);
      }
      return splitEvents;
  };

  const fetchCalendarTasks = async () => {
    try {
      const res = await taskService.getCalendarTasks();
      setRawTasks(res.data); 
      let allCalendarEvents = [];
      
      res.data.forEach(task => {
        const splitted = splitMultiDayEvent(task);

        if (splitted) {
            allCalendarEvents = [...allCalendarEvents, ...splitted];
        } else {
            let tStart = task.startDate || task.StartDate;
            let tDue = task.dueDate || task.DueDate;
            const isCompleted = task.isCompleted || task.IsCompleted;
            const priority = task.priority || task.Priority || 0;
            const itemType = task.type ?? task.Type ?? 0; 
            const isEvent = itemType === 1;

            let color = "#3b82f6";
            if (isCompleted) color = "#9ca3af";
            else if (isEvent) color = "#10b981";
            else if (priority === 3) color = "#ef4444";
            else if (priority === 2) color = "#f97316";

            const isAllDay = (!tStart || tStart.includes("00:00:00")) && (!tDue || tDue.includes("00:00:00"));

            let fcStart = tStart || tDue;
            let fcEnd = tDue || tStart;

            if (isAllDay && fcEnd && fcStart !== fcEnd) {
                fcEnd = addDaysSafe(fcEnd, 1); 
                if (fcStart) fcStart = fcStart.split('T')[0];
            }

            allCalendarEvents.push({
              id: String(task.id || task.Id),
              title: task.title || task.Title,
              start: fcStart, 
              end: fcEnd,
              allDay: isAllDay,
              backgroundColor: color,
              borderColor: color,
              classNames: (isCompleted && !isEvent) ? ['opacity-60', 'line-through'] : [],
              extendedProps: { ...task }
            });
        }
      });
      setEvents(allCalendarEvents);
    } catch (error) {
      console.error("Lỗi tải lịch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCalendarTasks(); }, []);

  const handleDateSelect = (selectInfo) => {
    let sDate = selectInfo.startStr.split('T')[0];
    let sTime = selectInfo.startStr.split('T')[1]?.substring(0,5) || "09:00";
    let eDate = selectInfo.endStr.split('T')[0];
    let eTime = selectInfo.endStr.split('T')[1]?.substring(0,5) || "10:00";

    if (selectInfo.allDay && selectInfo.startStr !== selectInfo.endStr) {
         eDate = addDaysSafe(selectInfo.endStr, -1);
    }

    setModal({
        isOpen: true,
        mode: 'create',
        id: null,
        title: '',
        type: 0,
        isAllDay: selectInfo.allDay,
        startDate: sDate,
        startTime: sTime,
        endDate: eDate,
        endTime: eTime,
        originalTask: null
    });

    selectInfo.view.calendar.unselect(); 
    
    // Thoát chế độ tạo đè ngay sau khi quét xong chuột
    if (isCreationMode) setIsCreationMode(false);
  };

  const handleEventClick = (clickInfo) => {
    // Ngăn click vào sự kiện nếu đang bật chế độ Tạo đè
    if (isCreationMode) return; 

    const task = clickInfo.event.extendedProps;
    if (task.isSplit) {
        alert("Khối lịch này là kết quả lặp lại của một Tác vụ kéo dài. Hệ thống sẽ mở Tác vụ gốc để bạn sửa.");
    }
    
    const targetId = task.originalId || task.id || task.Id;
    const original = rawTasks.find(t => String(t.id || t.Id) === String(targetId));
    if (!original) return;

    let tStart = original.startDate || original.StartDate || original.dueDate || original.DueDate;
    let tDue = original.dueDate || original.DueDate || tStart;

    let sDate = tStart.split('T')[0];
    let sTime = tStart.split('T')[1]?.substring(0,5) || "09:00";
    let eDate = tDue.split('T')[0];
    let eTime = tDue.split('T')[1]?.substring(0,5) || "10:00";

    const isAllDay = tStart.includes("00:00:00") && tDue.includes("00:00:00");

    setModal({
        isOpen: true,
        mode: 'edit',
        id: targetId,
        title: original.title || original.Title,
        type: original.type ?? original.Type ?? 0,
        isAllDay: isAllDay,
        startDate: sDate,
        startTime: sTime,
        endDate: eDate,
        endTime: eTime,
        originalTask: original
    });
  };

  const handleModalSave = async () => {
      if (!modal.title.trim()) { alert("Vui lòng nhập tên!"); return; }

      const finalStartISO = modal.isAllDay ? `${modal.startDate}T00:00:00` : `${modal.startDate}T${modal.startTime}:00`;
      const finalEndISO = modal.isAllDay ? `${modal.endDate}T00:00:00` : `${modal.endDate}T${modal.endTime}:00`;

      setIsLoading(true);
      try {
          if (modal.mode === 'create') {
              const newTask = {
                  title: modal.title.trim(),
                  startDate: finalStartISO,
                  dueDate: finalEndISO,
                  isCompleted: false,
                  priority: 0,
                  type: modal.type 
              };
              await taskService.create(newTask);
          } else {
              const payload = {
                  title: modal.title.trim(),
                  description: modal.originalTask.description || modal.originalTask.Description,
                  priority: modal.originalTask.priority || modal.originalTask.Priority || 0,
                  isCompleted: modal.originalTask.isCompleted || modal.originalTask.IsCompleted,
                  taskListId: modal.originalTask.taskListId || modal.originalTask.TaskListId,
                  parentTaskId: modal.originalTask.parentTaskId || modal.originalTask.ParentTaskId,
                  type: modal.type,
                  startDate: finalStartISO,
                  dueDate: finalEndISO
              };
              await taskService.update(modal.id, payload);
          }
          setModal({ ...modal, isOpen: false });
          fetchCalendarTasks();
      } catch (err) {
          alert("Lỗi khi lưu!");
          setIsLoading(false);
      }
  };

  const handleModalDelete = async () => {
      if (window.confirm("Bạn có chắc muốn đưa sự kiện này vào thùng rác?")) {
          await taskService.delete(modal.id);
          setModal({ ...modal, isOpen: false });
          fetchCalendarTasks();
      }
  };

  const handleEventChange = async (changeInfo) => {
    const originalTask = changeInfo.event.extendedProps;
    if (originalTask.isSplit) {
        alert("Bạn không thể kéo trực tiếp Khối sự kiện được tách từ Task nhiều ngày. Hãy nhấp vào nó để sửa ngày gốc.");
        changeInfo.revert();
        return;
    }

    const taskId = parseInt(originalTask.id || originalTask.Id, 10);
    let newStart = changeInfo.event.startStr;
    let newEnd = changeInfo.event.endStr || changeInfo.event.startStr;

    if (changeInfo.event.allDay) {
        if (newStart.length <= 10) newStart += "T00:00:00";
        if (changeInfo.event.endStr) {
            newEnd = addDaysSafe(changeInfo.event.endStr, -1) + "T00:00:00";
        } else {
            newEnd = newStart;
        }
    } else {
        newStart = newStart.split('+')[0];
        newEnd = newEnd.split('+')[0];
    }

    const payload = {
        title: originalTask.title || originalTask.Title,
        description: originalTask.description || originalTask.Description,
        priority: originalTask.priority || originalTask.Priority || 0,
        isCompleted: originalTask.isCompleted || originalTask.IsCompleted,
        taskListId: originalTask.taskListId || originalTask.TaskListId,
        parentTaskId: originalTask.parentTaskId || originalTask.ParentTaskId,
        type: originalTask.type ?? originalTask.Type ?? 0,
        startDate: newStart,
        dueDate: newEnd
    };

    try {
        await taskService.update(taskId, payload);
        fetchCalendarTasks(); 
    } catch (err) {
        alert("Lỗi cập nhật ngày!");
        changeInfo.revert(); 
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 p-6 relative flex flex-col">
      {isLoading && (
         <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
         </div>
      )}

      {/* HEADER CÓ NÚT TẠO ĐÈ (GHOSTING MODE) */}
      <div className="mb-4 flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Lịch trình</h1>
        </div>
        <button 
           onClick={() => setIsCreationMode(!isCreationMode)}
           className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[13px] shadow-sm transition-all duration-200 ${
              isCreationMode 
              ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
           }`}
        >
           <span className="material-symbols-outlined text-[18px]">
              {isCreationMode ? 'close' : 'add_box'}
           </span>
           {isCreationMode ? 'Hủy tạo đè' : 'Tạo đè lịch'}
        </button>
      </div>

      {/* BANNER THÔNG BÁO KHI BẬT CHẾ ĐỘ TẠO ĐÈ */}
      {isCreationMode && (
         <div className="mb-4 px-4 py-3 bg-blue-100/50 border border-blue-200 text-blue-700 rounded-xl text-[13px] font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-[20px] text-blue-500">info</span>
            Chế độ tạo đè đã bật: Lịch cũ đã được làm mờ. Hãy bấm hoặc kéo thả chuột vào khe hở bất kỳ để tạo mới!
         </div>
      )}

      {/* KHU VỰC LỊCH & HIỆU ỨNG GHOSTING (pointer-events-none) */}
      <div className={`flex-1 w-full bg-white rounded-md shadow-sm border overflow-hidden transition-all duration-300 ${
          isCreationMode 
          ? 'border-blue-400 ring-4 ring-blue-100 [&_.fc-event]:pointer-events-none [&_.fc-event]:opacity-40' 
          : 'border-slate-200'
      }`}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth" 
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric', omitCommas: true }}
          buttonText={{ today: 'Hôm nay', month: 'Tháng', week: 'Tuần', day: 'Ngày' }}
          events={events}
          editable={!isCreationMode} // Không cho kéo thả sự kiện cũ khi đang tạo đè
          selectable={true} 
          selectMirror={true} 
          dayMaxEvents={true} 
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventChange}   
          eventResize={handleEventChange} 
          locale="vi"
          firstDay={1} 
          slotLabelFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
          height="100%"
        />
      </div>

      {/* ========================================================= */}
      {/* POPUP (MODAL) CẬP NHẬT/TẠO MỚI HIỆN ĐẠI (Đã mở rộng UI) */}
      {/* ========================================================= */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
           {/* ĐÃ SỬA: Thay w-[460px] thành w-full max-w-[520px] để Modal rộng và thoáng hơn */}
           <div className="bg-white w-full max-w-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
               
               <div className="px-6 py-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                   <h2 className="text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                       {modal.mode === 'create' ? 'Thêm mới vào Lịch' : 'Chỉnh sửa Lịch'}
                   </h2>
                   <button onClick={() => setModal({...modal, isOpen: false})} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
                       <span className="material-symbols-outlined text-[20px]">close</span>
                   </button>
               </div>
               
               <div className="p-6 flex flex-col gap-6">
                  <input 
                     value={modal.title} 
                     onChange={e => setModal({...modal, title: e.target.value})}
                     placeholder="Tên công việc / sự kiện..." 
                     autoFocus
                     className="w-full text-xl font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none pb-2 transition-colors placeholder:text-slate-300" 
                  />
                  
                  {/* Phân loại Type */}
                  <div className="flex gap-8 mt-1">
                     <label className="flex items-center gap-2 cursor-pointer text-[14px] font-medium text-slate-700 hover:text-blue-600 transition-colors">
                        <input type="radio" checked={modal.type === 0} onChange={() => setModal({...modal, type: 0})} className="w-4.5 h-4.5 text-blue-600 focus:ring-blue-500" />
                        <span className="material-symbols-outlined text-[20px] text-blue-500">task_alt</span>
                        Công việc (Task)
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer text-[14px] font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                        <input type="radio" checked={modal.type === 1} onChange={() => setModal({...modal, type: 1})} className="w-4.5 h-4.5 text-emerald-600 focus:ring-emerald-500" />
                        <span className="material-symbols-outlined text-[20px] text-emerald-500">event</span>
                        Sự kiện (Event)
                     </label>
                  </div>

                  <div className="w-full h-px bg-slate-100 my-1"></div>

                  {/* Cấu hình Ngày giờ */}
                  <div className="flex flex-col gap-4">
                     <label className="flex items-center gap-2 cursor-pointer text-[14px] font-semibold text-slate-700 w-fit hover:text-blue-600 transition-colors">
                        <input type="checkbox" checked={modal.isAllDay} onChange={(e) => setModal({...modal, isAllDay: e.target.checked})} className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500" /> 
                        Cả ngày (All Day)
                     </label>

                     {/* ĐÃ SỬA: Sử dụng Grid thay vì Flex để các thẻ input không bao giờ bị bóp méo hay tràn */}
                     <div className="grid grid-cols-2 gap-6 w-full">
                        {/* Cột Bắt đầu */}
                        <div className="flex flex-col gap-2">
                           <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Bắt đầu lúc</span>
                           <div className="flex gap-2 w-full">
                              <input 
                                 type="date" 
                                 value={modal.startDate} 
                                 onChange={e => setModal({...modal, startDate: e.target.value})} 
                                 className="w-full border border-slate-200 rounded-lg p-2.5 text-[13.5px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                              />
                              {!modal.isAllDay && (
                                 <input 
                                    type="time" 
                                    value={modal.startTime} 
                                    onChange={e => setModal({...modal, startTime: e.target.value})} 
                                    className="w-[100px] shrink-0 border border-slate-200 rounded-lg p-2.5 text-[13.5px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                                 />
                              )}
                           </div>
                        </div>

                        {/* Cột Kết thúc */}
                        <div className="flex flex-col gap-2">
                           <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Kết thúc lúc</span>
                           <div className="flex gap-2 w-full">
                              <input 
                                 type="date" 
                                 value={modal.endDate} 
                                 onChange={e => setModal({...modal, endDate: e.target.value})} 
                                 className="w-full border border-slate-200 rounded-lg p-2.5 text-[13.5px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                              />
                              {!modal.isAllDay && (
                                 <input 
                                    type="time" 
                                    value={modal.endTime} 
                                    onChange={e => setModal({...modal, endTime: e.target.value})} 
                                    className="w-[100px] shrink-0 border border-slate-200 rounded-lg p-2.5 text-[13.5px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                                 />
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  {modal.mode === 'edit' && (
                     <button className="mr-auto text-rose-500 hover:bg-rose-100 hover:text-rose-600 px-4 py-2.5 rounded-lg font-bold text-[13.5px] transition-colors flex items-center gap-1.5" onClick={handleModalDelete}>
                         <span className="material-symbols-outlined text-[18px]">delete</span> Xóa
                     </button>
                  )}
                  <button className="text-slate-600 hover:bg-slate-200 px-5 py-2.5 rounded-lg font-bold text-[13.5px] transition-colors" onClick={() => setModal({...modal, isOpen: false})}>Hủy bỏ</button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-[13.5px] shadow-sm transition-all active:scale-95" onClick={handleModalSave}>Xác nhận Lưu</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}