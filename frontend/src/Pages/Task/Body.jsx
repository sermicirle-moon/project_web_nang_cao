import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { taskService } from "../../api/taskService";
import TaskInput from "./Components/TaskInput";
import TaskDetail from "./Components/TaskDetail";

const FILTER_NAMES = {
  inbox: 'Hộp thư đến',
  today: 'Hôm nay',
  next7days: '7 Ngày tới',
  completed: 'Đã hoàn thành',
  blocked: 'Không làm',
  trash: 'Thùng rác'
};

const getShortWeekday = (date) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
};

const formatTickTickHeaderDate = (date) => {
  return `${getShortWeekday(date)}, ${date.getDate()} Thg ${date.getMonth() + 1}`;
};

export default function Body() {
  const { listId } = useParams(); 
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const listNameDisplay = FILTER_NAMES[listId] || location.state?.name || "Danh sách tác vụ";
  const isReadOnlyView = ['completed', 'blocked', 'trash'].includes(listId);
  const isDateView = listId === 'today' || listId === 'next7days';

  const fetchTasks = async () => {
    if (!listId) return;
    setTasks([]); 
    setIsLoading(true);
    try {
      const parsedId = parseInt(listId, 10);
      let res;
      if (!isNaN(parsedId)) {
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

  const handleAddTask = async (taskPayload) => {
    const parsedId = parseInt(listId, 10);
    const finalPayload = {
      ...taskPayload,
      taskListId: !isNaN(parsedId) ? parsedId : null
    };

    try {
      const res = await taskService.create(finalPayload);
      const newTask = res.data;
      if (newTask && (newTask.id || newTask.Id)) {
        setTasks([newTask, ...tasks]); 
      } else {
        fetchTasks();
      }
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

  const getPriorityClasses = (priority, isCompleted) => {
    if (isCompleted) return "border-slate-300 bg-blue-500 border-blue-500";
    switch (priority) {
      case 3: return "border-red-500 hover:bg-red-50";     
      case 2: return "border-orange-500 hover:bg-orange-50"; 
      case 1: return "border-blue-500 hover:bg-blue-50";   
      default: return "border-slate-300 hover:border-blue-500 hover:bg-slate-50"; 
    }
  };

  // =========================================================================
  // LOGIC HIỂN THỊ THỜI LƯỢNG (DURATION) DƯỚI TÊN TASK CHUẨN TICKTICK
  // =========================================================================
  const renderDuration = (task) => {
    const sDateStr = task.startDate || task.StartDate;
    const dDateStr = task.dueDate || task.DueDate;

    // 1. Nếu không có Start Date -> Mặc định là Task không có Duration -> Ẩn đi
    if (!sDateStr) return null;

    const sDate = new Date(sDateStr);
    const dDate = new Date(dDateStr || sDateStr);

    // Kiểm tra xem có phải All Day không (Giờ và phút đều là 00:00)
    const isSMidnight = sDate.getHours() === 0 && sDate.getMinutes() === 0;
    const isDMidnight = dDate.getHours() === 0 && dDate.getMinutes() === 0;
    const isAllDay = isSMidnight && isDMidnight;

    const sameDay = sDate.toDateString() === dDate.toDateString();

    const formatD = (d) => `${d.getDate()} Thg ${d.getMonth() + 1}`;
    const formatT = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    // 2. Xử lý hiển thị All Day (Cả ngày)
    if (isAllDay) {
      if (sameDay) return "Cả ngày";
      return `${formatD(sDate)} - ${formatD(dDate)} (Cả ngày)`;
    }

    // 3. Xử lý hiển thị có giờ cụ thể
    if (sameDay) return `${formatT(sDate)} - ${formatT(dDate)}`;
    return `${formatD(sDate)}, ${formatT(sDate)} - ${formatD(dDate)}, ${formatT(dDate)}`;
  };

  const getGroupedTasks = () => {
    if (!isDateView) {
      const active = tasks.filter(t => !(t.isCompleted || t.IsCompleted));
      const completed = tasks.filter(t => (t.isCompleted || t.IsCompleted));
      
      // LUẬT SẮP XẾP: Ở List thường -> Mới nhất lên đầu
      active.sort((a, b) => (b.id || b.Id) - (a.id || a.Id));
      
      return [
        ...(active.length > 0 ? [{ id: 'active', label: '', hideHeader: true, tasks: active }] : []),
        ...(completed.length > 0 ? [{ id: 'completed', label: 'Đã hoàn thành', color: 'text-slate-700', hideHeader: false, tasks: completed }] : [])
      ];
    }

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

      const taskDate = task.dueDate || task.DueDate; 
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
          groups.upcoming[dateKey] = { label: formatTickTickHeaderDate(dueDateObj), color: 'text-slate-800', hideHeader: false, tasks: [] };
        }
        groups.upcoming[dateKey].tasks.push(task);
      }
    });

    // =========================================================================
    // LUẬT SẮP XẾP: Ưu tiên trước -> Thời gian tạo (ID) sau (Luôn từ trên xuống)
    // =========================================================================
    const sortTasks = (taskArr) => {
      taskArr.sort((a, b) => {
        const pA = a.priority || a.Priority || 0;
        const pB = b.priority || b.Priority || 0;
        if (pA !== pB) return pB - pA; // 1. So sánh cờ ưu tiên
        return (b.id || b.Id) - (a.id || a.Id); // 2. So sánh Task mới tạo (ID lớn hơn nằm trên)
      });
    };

    sortTasks(groups.overdue.tasks);
    sortTasks(groups.today.tasks);
    sortTasks(groups.tomorrow.tasks);
    sortTasks(groups.noDate.tasks);
    Object.values(groups.upcoming).forEach(g => sortTasks(g.tasks));

    const sections = [];
    if (groups.overdue.tasks.length > 0) sections.push({ id: 'overdue', ...groups.overdue });
    if (groups.today.tasks.length > 0) sections.push({ id: 'today', ...groups.today });
    if (groups.tomorrow.tasks.length > 0) sections.push({ id: 'tomorrow', ...groups.tomorrow });
    Object.keys(groups.upcoming).sort().forEach(key => sections.push({ id: key, ...groups.upcoming[key] }));
    if (groups.noDate.tasks.length > 0) sections.push({ id: 'noDate', ...groups.noDate });
    if (groups.completed.tasks.length > 0) sections.push({ id: 'completed', ...groups.completed });

    return sections;
  };

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
          </div>

          <TaskInput listId={listId} isReadOnlyView={isReadOnlyView} onAddTask={handleAddTask} />

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
                    </div>
                  )}
                  
                  <div className="flex flex-col pl-1">
                    {section.tasks.map((task) => {
                      const taskId = task.id || task.Id;
                      const taskTitle = task.title || task.Title;
                      const isCompleted = task.isCompleted || task.IsCompleted;
                      const taskListId = task.taskListId !== undefined ? task.taskListId : task.TaskListId;
                      const priority = task.priority || task.Priority || 0;
                      
                      // Gọi hàm render để lấy text Thời lượng và Ngày tháng bên phải
                      const taskDate = task.dueDate || task.DueDate;
                      const rightLabel = getRightSideDateLabel(taskDate, isCompleted);
                      const durationText = renderDuration(task);
                      
                      return (
                        <div
                          key={taskId}
                          onClick={() => setSelectedTaskId(taskId)}
                          className={`group flex items-center px-2 py-2.5 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors rounded-md ${
                            selectedTaskId === taskId ? "bg-blue-50/50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="shrink-0 w-8 flex items-center">
                            <button
                              onClick={(e) => handleToggle(e, task)}
                              className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all duration-200 ${getPriorityClasses(priority, isCompleted)}`}
                            >
                              {isCompleted && <span className="material-symbols-outlined text-white text-[13px] font-bold">check</span>}
                            </button>
                          </div>

                          <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
                            <p className={`text-[14px] truncate transition-colors ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                              {taskTitle}
                            </p>
                            
                            {/* HIỂN THỊ DURATION NẾU TASK CÓ THIẾT LẬP THỜI LƯỢNG */}
                            {durationText && !isCompleted && (
                              <span className="text-[11.5px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[13px] text-blue-500">schedule</span>
                                {durationText}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-end shrink-0 gap-3">
                            <div className="flex items-center gap-1.5 text-[12px]">
                               
                               {/* HIỂN THỊ CỜ NẾU CÓ ƯU TIÊN */}
                               {priority === 3 && !isCompleted && <span className="material-symbols-outlined text-red-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                               {priority === 2 && !isCompleted && <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                               {priority === 1 && !isCompleted && <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}

                               {taskListId === null && !isCompleted && isDateView && (
                                  <span className="text-slate-400 font-medium mr-1 ml-1">Inbox</span>
                               )}
                               
                               {/* LABEL NGÀY BÊN PHẢI (LUÔN HIỂN THỊ CHUẨN XÁC) */}
                               {rightLabel && (
                                  <span className={`${rightLabel.color} font-medium`}>{rightLabel.text}</span>
                               )}
                            </div>
                            <div className="w-5 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-slate-300 text-[18px] cursor-grab hover:text-slate-500">drag_indicator</span>
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

      <TaskDetail task={selectedTask} onClose={() => setSelectedTaskId(null)} listNameDisplay={listNameDisplay} />
      
    </div>
  );
}