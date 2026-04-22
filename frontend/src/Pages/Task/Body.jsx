import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { taskService } from "../../api/taskService";

const FILTER_NAMES = {
  inbox: 'Hộp thư đến',
  today: 'Hôm nay',
  next7days: '7 Ngày tới',
  completed: 'Đã hoàn thành',
  blocked: 'Không làm',
  trash: 'Thùng rác'
};

// Hàm lấy tên Thứ viết tắt chuẩn (T2, T3, CN...)
const getShortWeekday = (date) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
};

// Hàm định dạng ngày chuẩn (VD: T5, 23 Thg 4)
const formatTickTickHeaderDate = (date) => {
  return `${getShortWeekday(date)}, ${date.getDate()} Thg ${date.getMonth() + 1}`;
};

export default function Body() {
  const { listId } = useParams(); 
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const listNameDisplay = FILTER_NAMES[listId] || location.state?.name || "Danh sách tác vụ";
  const isReadOnlyView = ['completed', 'blocked', 'trash'].includes(listId);
  const isDateView = listId === 'today' || listId === 'next7days';

  const fetchTasks = async () => {
    if (!listId) return;
    setTasks([]); 
    setIsLoading(true);
    
    try {
      const parsedId = parseInt(listId, 10);
      const isNumericList = !isNaN(parsedId);

      let res;
      if (isNumericList) {
        res = await taskService.getTasksByList(parsedId);
      } else {
        res = await taskService.getTasksByFilter(listId);
      }
      setTasks(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    setSelectedTaskId(null); 
  }, [listId]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const parsedId = parseInt(listId, 10);
    const isNumericList = !isNaN(parsedId);

    let targetDate = null;
    // ĐÚNG YÊU CẦU: Tạo ở 7 Ngày tới HOẶC Hôm nay đều gán mặc định là Hôm nay
    if (listId === "today" || listId === "next7days") {
      const today = new Date();
      targetDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    }

    const payload = {
      title: newTaskTitle.trim(),
      taskListId: isNumericList ? parsedId : null,
      dueDate: targetDate, 
      priority: 0
    };

    try {
      const res = await taskService.create(payload);
      const newTask = res.data;
      
      // ====================================================
      // LỚP BẢO VỆ CHỐNG TÀNG HÌNH & "NO DATE" CỦA C#
      // ====================================================
      if (payload.endDate) {
        newTask.endDate = payload.endDate;
        newTask.dueDate = payload.endDate;
      }

      if (newTask && (newTask.id || newTask.Id)) {
        setTasks([newTask, ...tasks]); 
      } else {
        fetchTasks();
      }
      
      setNewTaskTitle("");
      setIsInputFocused(false);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể thêm tác vụ.");
    }
  };

  const handleToggle = async (e, task) => {
    e.stopPropagation();
    const taskId = task.id || task.Id;
    setTasks(tasks.map(t => (t.id || t.Id) === taskId ? { ...t, isCompleted: !(t.isCompleted || t.IsCompleted) } : t));
    try {
      await taskService.toggleComplete(taskId);
    } catch (err) {
      fetchTasks();
    }
  };

  // THUẬT TOÁN GOM NHÓM: DÙNG LABEL TIẾNG VIỆT CHUẨN XÁC
  const getGroupedTasks = () => {
    
    // 1. Nếu là List tự tạo hoặc Hộp thư đến -> Danh sách phẳng (Không có ngày)
    if (!isDateView) {
      const active = tasks.filter(t => !(t.isCompleted || t.IsCompleted));
      const completed = tasks.filter(t => (t.isCompleted || t.IsCompleted));
      const sections = [];
      
      if (active.length > 0) {
        sections.push({ id: 'active', label: '', hideHeader: true, tasks: active });
      }
      if (completed.length > 0) {
        sections.push({ id: 'completed', label: 'Đã hoàn thành', color: 'text-slate-700', hideHeader: false, tasks: completed });
      }
      return sections;
    }

    // 2. Nếu là Hôm nay hoặc 7 Ngày tới -> Gom nhóm thời gian
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const groups = {
      overdue: { label: 'Quá hạn', color: 'text-rose-600', hideHeader: false, tasks: [] },
      today: { label: `${getShortWeekday(now)}, Hôm nay`, color: 'text-slate-800', hideHeader: false, tasks: [] },
      tomorrow: { label: `${getShortWeekday(tomorrowDate)}, Ngày mai`, color: 'text-slate-800', hideHeader: false, tasks: [] },
      upcoming: {}, 
      noDate: { label: 'Chưa lên lịch', color: 'text-slate-500', hideHeader: false, tasks: [] },
      completed: { label: 'Đã hoàn thành', color: 'text-slate-400', hideHeader: false, tasks: [] }
    };

    tasks.forEach(task => {
      const isCompleted = task.isCompleted || task.IsCompleted;
      if (isCompleted) {
        groups.completed.tasks.push(task);
        return;
      }

      const taskDate = task.dueDate; 
      
      if (!taskDate) {
        groups.noDate.tasks.push(task);
        return;
      }

      const dueDateObj = new Date(taskDate);
      dueDateObj.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) groups.overdue.tasks.push(task);
      else if (diffDays === 0) groups.today.tasks.push(task);
      else if (diffDays === 1) groups.tomorrow.tasks.push(task);
      else {
        const dateKey = dueDateObj.toISOString().split('T')[0];
        if (!groups.upcoming[dateKey]) {
          groups.upcoming[dateKey] = { 
            label: formatTickTickHeaderDate(dueDateObj), 
            color: 'text-slate-800', 
            hideHeader: false,
            tasks: [] 
          };
        }
        groups.upcoming[dateKey].tasks.push(task);
      }
    });

    const sections = [];
    if (groups.overdue.tasks.length > 0) sections.push({ id: 'overdue', ...groups.overdue });
    if (groups.today.tasks.length > 0) sections.push({ id: 'today', ...groups.today });
    if (groups.tomorrow.tasks.length > 0) sections.push({ id: 'tomorrow', ...groups.tomorrow });

    Object.keys(groups.upcoming).sort().forEach(key => {
      sections.push({ id: key, ...groups.upcoming[key] });
    });

    if (groups.noDate.tasks.length > 0) sections.push({ id: 'noDate', ...groups.noDate });
    if (groups.completed.tasks.length > 0) sections.push({ id: 'completed', ...groups.completed });

    return sections;
  };

  // NHÃN THỜI GIAN BÊN PHẢI (Hôm nay, Hôm qua, 10 Thg 4...)
  const getRightSideDateLabel = (dateString, isCompleted) => {
    if (!dateString || isCompleted) return null;
    const dueDate = new Date(dateString);
    dueDate.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -1) return { text: `${dueDate.getDate()} Thg ${dueDate.getMonth() + 1}`, color: 'text-rose-500' };
    if (diffDays === -1) return { text: 'Hôm qua', color: 'text-rose-500' };
    if (diffDays === 0) return { text: 'Hôm nay', color: 'text-blue-500' };
    if (diffDays === 1) return { text: 'Ngày mai', color: 'text-purple-500' };
    return { text: getShortWeekday(dueDate), color: 'text-slate-400' };
  };

  const selectedTask = tasks.find((t) => (t.id || t.Id) === selectedTaskId);
  const groupedSections = getGroupedTasks();

  return (
    <div className="flex w-full h-full bg-white overflow-hidden">
      
      <div className="flex-1 px-8 py-8 overflow-y-auto custom-scrollbar scroll-smooth">
        <div className="w-full">
          
          <div className="mb-6 flex items-end justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold text-slate-800 tracking-tight leading-none">{listNameDisplay}</h1>
              <span className="text-[12px] font-semibold text-slate-400 mt-1">
                 {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="flex gap-1 text-slate-400">
               <button className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[20px]">sort</span></button>
               <button className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
            </div>
          </div>

          {!isReadOnlyView && (
            <div className={`mb-8 transition-all duration-300 rounded-xl border ${
               isInputFocused ? 'border-blue-500 bg-white shadow-[0_2px_12px_rgba(59,130,246,0.1)]' : 'border-transparent bg-slate-50 hover:bg-slate-100'
            }`}>
              <div className="flex items-center px-4">
                <span className={`material-symbols-outlined text-[20px] transition-colors ${isInputFocused ? 'text-blue-500' : 'text-slate-400'}`}>add</span>
                <input
                  className="w-full px-3 py-3.5 outline-none text-slate-700 text-[14px] font-medium placeholder:text-slate-500 bg-transparent"
                  placeholder={`Thêm tác vụ...`}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
              </div>

              <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isInputFocused ? 'max-h-16 opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 py-2 flex justify-between items-center bg-white rounded-b-xl">
                  <div className="flex gap-1 text-slate-400">
                     <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 hover:text-blue-500 rounded transition-colors"><span className="material-symbols-outlined text-[16px]">calendar_today</span></button>
                     <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 hover:text-rose-500 rounded transition-colors"><span className="material-symbols-outlined text-[16px]">flag</span></button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsInputFocused(false)} className="px-3 py-1.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md transition-colors">Hủy</button>
                    <button onClick={handleAddTask} className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-[13px] font-semibold shadow-sm transition-colors">Lưu</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col w-full pb-10">
            {isLoading ? (
               <div className="py-12 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div></div>
            ) : tasks.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 mb-4 opacity-50 grayscale flex items-center justify-center"><span className="material-symbols-outlined text-[64px] text-slate-300">task</span></div>
                 <h3 className="text-[15px] font-bold text-slate-600 mb-1">Đã hoàn thành mọi việc</h3>
                 <p className="text-slate-400 text-[13px]">Bạn không có tác vụ nào ở đây.</p>
               </div>
            ) : (
              groupedSections.map((section) => (
                <div key={section.id} className="mb-6">
                  
                  {!section.hideHeader && (
                    <div className={`flex items-center justify-between mb-2 px-1 border-b border-slate-50 pb-1.5`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[18px] transition-transform cursor-pointer hover:bg-slate-100 rounded-sm ${section.color}`}>expand_more</span>
                        <h3 className={`text-[13px] font-bold tracking-wide ${section.color}`}>{section.label}</h3>
                        <span className="text-[11px] font-bold text-slate-300 ml-1">{section.tasks.length}</span>
                      </div>
                      
                      {section.id === 'overdue' && (
                        <button className="text-[12px] font-medium text-blue-500 hover:underline px-2">Trì hoãn</button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col pl-1">
                    {section.tasks.map((task) => {
                      const taskId = task.id || task.Id;
                      const taskTitle = task.title || task.Title;
                      const isCompleted = task.isCompleted || task.IsCompleted;
                      const taskListId = task.taskListId !== undefined ? task.taskListId : task.TaskListId;
                      const taskDate = task.endDate || task.EndDate || task.dueDate || task.DueDate;
                      
                      const rightLabel = getRightSideDateLabel(taskDate, isCompleted);
                      
                      return (
                        <div
                          key={taskId}
                          onClick={() => setSelectedTaskId(taskId)}
                          className={`group flex items-center px-2 py-2.5 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors rounded-md ${
                            selectedTaskId === taskId ? "bg-blue-50/50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="shrink-0 w-6 flex items-center">
                            <button
                              onClick={(e) => handleToggle(e, task)}
                              className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all duration-200 ${
                                isCompleted ? "bg-blue-500 border-blue-500" : "border-slate-300 hover:border-blue-500"
                              }`}
                            >
                              {isCompleted && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                            </button>
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <p className={`text-[14px] truncate transition-colors ${
                              isCompleted ? "text-slate-400 line-through" : "text-slate-800"
                            }`}>
                              {taskTitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-end shrink-0 gap-3">
                            <div className="flex items-center gap-1.5 text-[12px]">
                               {/* CHỮ INBOX CỐ ĐỊNH, KHÔNG CẦN HOVER NỮA */}
                               {taskListId === null && !isCompleted && isDateView && (
                                  <span className="text-slate-400 font-medium mr-1">Inbox</span>
                               )}
                               {rightLabel && (
                                  <span className={`${rightLabel.color} font-medium`}>{rightLabel.text}</span>
                               )}
                            </div>
                            <div className="w-5 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {listId === 'trash' ? (
                                <button className="text-rose-400 hover:text-rose-600"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                              ) : (
                                <span className="material-symbols-outlined text-slate-300 text-[18px] cursor-grab hover:text-slate-500">drag_indicator</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedTask && (() => {
        const detailTitle = selectedTask.title || selectedTask.Title;
        const detailDate = selectedTask.endDate || selectedTask.EndDate || selectedTask.dueDate || selectedTask.DueDate;
        const detailCompleted = selectedTask.isCompleted || selectedTask.IsCompleted;
        const detailDescription = selectedTask.description || selectedTask.Description || "";

        return (
          <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
             <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                <span className="text-[12px] font-bold text-slate-400 tracking-wider">CHI TIẾT</span>
                <button onClick={() => setSelectedTaskId(null)} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                   <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
             </div>
             
             <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                <textarea 
                   className={`w-full text-[18px] font-bold text-slate-800 outline-none resize-none bg-transparent placeholder:text-slate-300 leading-snug ${detailCompleted ? 'line-through text-slate-400' : ''}`}
                   defaultValue={detailTitle}
                   rows={2}
                   placeholder="Tên tác vụ..."
                />
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 text-[13px] text-slate-600 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
                    <span className="material-symbols-outlined text-[18px] text-blue-500">calendar_month</span>
                    <span className="font-medium text-slate-700 flex-1">{detailDate ? new Date(detailDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Ngày đến hạn'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-slate-600 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
                    <span className="material-symbols-outlined text-[18px] text-purple-500">folder</span>
                    <span className="font-medium text-slate-700 flex-1">{listNameDisplay}</span>
                  </div>
                </div>

                <div className="mt-6">
                   <textarea 
                      className="w-full text-[13px] text-slate-600 bg-slate-50 border border-transparent focus:border-blue-300 focus:bg-white rounded-lg p-3 outline-none resize-none transition-colors"
                      placeholder="Mô tả..."
                      rows={8}
                      defaultValue={detailDescription}
                   />
                </div>
             </div>

             <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-[12px] text-slate-400">
                <button className="hover:text-slate-600 transition-colors"><span className="material-symbols-outlined text-[18px]">push_pin</span></button>
                <span>Đã tạo hôm nay</span>
                <button className="hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
             </div>
          </div>
        )
      })()}
    </div>
  );
}