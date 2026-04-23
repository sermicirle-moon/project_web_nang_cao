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
  
  // Trạng thái thu gọn/mở rộng nhóm
  const [collapsedSections, setCollapsedSections] = useState({});
  
  // Trạng thái quản lý Task Menu ("...") nào đang được mở
  const [activeTaskMenuId, setActiveTaskMenuId] = useState(null);

  const listNameDisplay = FILTER_NAMES[listId] || location.state?.name || "Danh sách tác vụ";
  const isReadOnlyView = ['completed', 'blocked', 'trash'].includes(listId);
  const isDateView = listId === 'today' || listId === 'next7days';

  // Đóng Task Menu khi click ra ngoài không gian khác
  useEffect(() => {
    const handleClickOutside = () => setActiveTaskMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchTasks = async () => {
    if (!listId) return;
    setTasks([]); 
    setIsLoading(true);
    try {
      let res;
      if (listId.startsWith('tag-')) {
        const tagId = parseInt(listId.replace('tag-', ''), 10);
        res = await taskService.getTasksByTag(tagId);
      } else {
        const parsedId = parseInt(listId, 10);
        if (!isNaN(parsedId)) {
          res = await taskService.getTasksByList(parsedId);
        } else {
          res = await taskService.getTasksByFilter(listId);
        }
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
    setCollapsedSections({});
    setActiveTaskMenuId(null);
  }, [listId]);

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleAddTask = async (taskPayload) => {
    let finalPayload = { ...taskPayload };
    const parsedId = parseInt(listId, 10);

    if (listId.startsWith('tag-')) {
      const tagId = parseInt(listId.replace('tag-', ''), 10);
      finalPayload.tagIds = [...(finalPayload.tagIds || []), tagId];
      finalPayload.taskListId = null;
    } else {
      // Chỉ gán taskListId nếu không phải là subtask (vì Subtask kế thừa từ hàm handleAddSubtask rồi)
      if (finalPayload.taskListId === undefined) {
         finalPayload.taskListId = !isNaN(parsedId) ? parsedId : null;
      }
    }

    try {
      const res = await taskService.create(finalPayload);
      const newTask = res.data;
      if (newTask && (newTask.id || newTask.Id)) {
        // Nếu là Subtask thì không cần hiện ngoài List, nếu là Task chính thì đẩy lên đầu List
        if (!finalPayload.parentTaskId) {
           setTasks([newTask, ...tasks]); 
        }
      } else {
        fetchTasks();
      }
    } catch (err) {
      alert("Không thể thêm tác vụ.");
    }
  };

  // HÀM XỬ LÝ SUBTASK (TẠO NHANH QUA PROMPT)
  const handleAddSubtask = (parentTaskId, parentListId) => {
    const subtaskTitle = window.prompt("Nhập tên Subtask mới:");
    if (subtaskTitle && subtaskTitle.trim()) {
      handleAddTask({
        title: subtaskTitle.trim(),
        parentTaskId: parentTaskId,
        taskListId: parentListId // Subtask kế thừa List của Task cha
      });
    }
  };

  // HÀM XỬ LÝ XÓA TASK
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tác vụ này?")) {
      try {
        await taskService.delete(taskId);
        setTasks(tasks.filter(t => (t.id || t.Id) !== taskId)); // Cập nhật List ngay lập tức
        if (selectedTaskId === taskId) setSelectedTaskId(null); 
      } catch (error) {
        alert("Lỗi khi xóa tác vụ.");
      }
    }
  };

  const handleToggle = async (e, task) => {
    e.stopPropagation();
    const taskId = task.id || task.Id;
    const currentStatus = task.isCompleted !== undefined ? task.isCompleted : task.IsCompleted;
    
    // Optimistic Update
    setTasks(tasks.map(t => ((t.id || t.Id) === taskId ? { ...t, isCompleted: !currentStatus, IsCompleted: !currentStatus } : t)));

    try {
      await taskService.toggleComplete(taskId);
    } catch (err) {
      fetchTasks();
    }
  };

  const getPriorityClasses = (priority, isCompleted) => {
    if (isCompleted) return "border-slate-300 bg-slate-300";
    switch (priority) {
      case 3: return "border-red-500 hover:bg-red-50";     
      case 2: return "border-orange-500 hover:bg-orange-50"; 
      case 1: return "border-blue-500 hover:bg-blue-50";   
      default: return "border-slate-300 hover:border-blue-500 hover:bg-slate-50"; 
    }
  };

  const renderDuration = (task) => {
    const sDateStr = task.startDate || task.StartDate;
    const dDateStr = task.dueDate || task.DueDate;
    if (!sDateStr) return null;

    const sDate = new Date(sDateStr);
    const dDate = new Date(dDateStr || sDateStr);
    const isAllDay = sDate.getHours() === 0 && sDate.getMinutes() === 0 && dDate.getHours() === 0 && dDate.getMinutes() === 0;
    const sameDay = sDate.toDateString() === dDate.toDateString();

    const fD = (d) => `${d.getDate()} Thg ${d.getMonth() + 1}`;
    const fT = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    if (isAllDay) return sameDay ? "Cả ngày" : `${fD(sDate)} - ${fD(dDate)} (Cả ngày)`;
    return sameDay ? `${fT(sDate)} - ${fT(dDate)}` : `${fD(sDate)}, ${fT(sDate)} - ${fD(dDate)}, ${fT(dDate)}`;
  };

  const getGroupedTasks = () => {
    const sortFn = (a, b, isComp = false) => {
      if (!isComp) {
        const pA = a.priority || a.Priority || 0;
        const pB = b.priority || b.Priority || 0;
        if (pA !== pB) return pB - pA;
      }
      return (b.id || b.Id) - (a.id || a.Id);
    };

    if (!isDateView) {
      const active = tasks.filter(t => !(t.isCompleted || t.IsCompleted)).sort((a,b) => sortFn(a,b));
      const completed = tasks.filter(t => (t.isCompleted || t.IsCompleted)).sort((a,b) => sortFn(a,b, true));
      return [
        ...(active.length > 0 ? [{ id: 'active', label: '', hideHeader: true, tasks: active }] : []),
        ...(completed.length > 0 ? [{ id: 'completed', label: 'Đã hoàn thành', color: 'text-slate-500', tasks: completed }] : [])
      ];
    }

    const now = new Date(); now.setHours(0,0,0,0);
    const groups = { overdue: { label: 'Quá hạn', color: 'text-rose-600', tasks: [] }, today: { label: `${getShortWeekday(now)}, Hôm nay`, color: 'text-slate-800', tasks: [] }, upcoming: {}, noDate: { label: 'Chưa lên lịch', color: 'text-slate-500', tasks: [] }, completed: { label: 'Đã hoàn thành', color: 'text-slate-500', tasks: [] } };

    tasks.forEach(task => {
      if (task.isCompleted || task.IsCompleted) { groups.completed.tasks.push(task); return; }
      const taskDate = task.dueDate || task.DueDate;
      if (!taskDate) { groups.noDate.tasks.push(task); return; }
      const dObj = new Date(taskDate); dObj.setHours(0,0,0,0);
      const diff = Math.ceil((dObj.getTime() - now.getTime()) / 86400000);
      if (diff < 0) groups.overdue.tasks.push(task);
      else if (diff === 0) groups.today.tasks.push(task);
      else {
        const key = dObj.toISOString().split('T')[0];
        if (!groups.upcoming[key]) groups.upcoming[key] = { label: formatTickTickHeaderDate(dObj), color: 'text-slate-800', tasks: [] };
        groups.upcoming[key].tasks.push(task);
      }
    });

    Object.values(groups).forEach(g => g.tasks?.sort((a,b) => sortFn(a,b)));
    const sections = [];
    if (groups.overdue.tasks.length > 0) sections.push({ id: 'overdue', ...groups.overdue });
    if (groups.today.tasks.length > 0) sections.push({ id: 'today', ...groups.today });
    Object.keys(groups.upcoming).sort().forEach(k => sections.push({ id: k, ...groups.upcoming[k] }));
    if (groups.noDate.tasks.length > 0) sections.push({ id: 'noDate', ...groups.noDate });
    if (groups.completed.tasks.length > 0) sections.push({ id: 'completed', ...groups.completed });
    return sections;
  };

  const getRightSideDateLabel = (dateString, isCompleted) => {
    if (!dateString) return null;
    const dueDate = new Date(dateString); dueDate.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
    let text = diff < -1 ? `${dueDate.getDate()} Thg ${dueDate.getMonth() + 1}` : diff === -1 ? 'Hôm qua' : diff === 0 ? 'Hôm nay' : diff === 1 ? 'Ngày mai' : getShortWeekday(dueDate);
    return { text, color: isCompleted ? 'text-slate-400' : (diff < 0 ? 'text-rose-500' : diff === 0 ? 'text-blue-500' : 'text-slate-500') };
  };

  const selectedTask = tasks.find((t) => (t.id || t.Id) === selectedTaskId);
  const groupedSections = getGroupedTasks();

  return (
    <div className="flex w-full h-full bg-white overflow-hidden">
      <div className="flex-1 px-8 py-8 overflow-y-auto custom-scrollbar scroll-smooth">
        <div className="w-full">
          
          {/* TIÊU ĐỀ LIST */}
          <div className="mb-6 flex items-end justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold text-slate-800 tracking-tight leading-none">{listNameDisplay}</h1>
              <span className="text-[12px] font-semibold text-slate-400 mt-1">{new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
          </div>

          <TaskInput listId={listId} isReadOnlyView={isReadOnlyView} onAddTask={handleAddTask} />

          {/* DANH SÁCH TASK */}
          <div className="flex flex-col w-full pb-10">
            {isLoading ? (
               <div className="py-12 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div></div>
            ) : tasks.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
                 <span className="material-symbols-outlined text-[64px] mb-2 opacity-20">task</span>
                 <h3 className="text-[15px] font-bold">Danh sách trống</h3>
               </div>
            ) : (
              groupedSections.map((section) => (
                <div key={section.id} className="mb-6">
                  {!section.hideHeader && (
                    <div className="flex items-center gap-1.5 mb-2 px-1 border-b border-slate-50 pb-1.5 cursor-pointer select-none" onClick={() => toggleSection(section.id)}>
                      <span className={`material-symbols-outlined text-[18px] transition-transform ${section.color} ${collapsedSections[section.id] ? '-rotate-90' : ''}`}>expand_more</span>
                      <h3 className={`text-[13px] font-bold tracking-wide ${section.color}`}>{section.label}</h3>
                      <span className="text-[11px] font-bold text-slate-300 ml-1">{section.tasks.length}</span>
                    </div>
                  )}
                  
                  {!collapsedSections[section.id] && (
                    <div className="flex flex-col pl-1 animate-in fade-in duration-200">
                      {section.tasks.map((task) => {
                        const taskId = task.id || task.Id;
                        const isCompleted = task.isCompleted || task.IsCompleted;
                        const rightLabel = getRightSideDateLabel(task.dueDate || task.DueDate, isCompleted);
                        const durationText = renderDuration(task);
                        const taskListId = task.taskListId !== undefined ? task.taskListId : task.TaskListId;
                        const priority = task.priority || task.Priority || 0;

                        return (
                          <div key={taskId} onClick={() => setSelectedTaskId(taskId)} className={`group flex items-center px-2 py-2.5 cursor-pointer border-b border-slate-50 last:border-b-0 rounded-md transition-colors ${selectedTaskId === taskId ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                            
                            {/* CHECKBOX */}
                            <div className="shrink-0 w-8 flex items-center">
                              <button onClick={(e) => handleToggle(e, task)} className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all ${getPriorityClasses(priority, isCompleted)}`}>
                                {isCompleted && <span className="material-symbols-outlined text-white text-[13px] font-bold">check</span>}
                              </button>
                            </div>
                            
                            {/* NỘI DUNG TASK */}
                            <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
                              <p className={`text-[14px] truncate ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title || task.Title}</p>
                              {durationText && (
                                <span className={`text-[11.5px] font-medium flex items-center gap-1 mt-0.5 ${isCompleted ? 'text-slate-300 line-through' : 'text-slate-500'}`}>
                                  <span className={`material-symbols-outlined text-[13px] ${isCompleted ? 'text-slate-300' : 'text-blue-500'}`}>schedule</span>
                                  {durationText}
                                </span>
                              )}
                            </div>

                            {/* RIGHT CỘT: CỜ, INBOX, NGÀY THÁNG & NÚT ACTIONS */}
                            <div className="flex items-center justify-end shrink-0 gap-2 pl-3">
                              
                              {/* Thông tin Cờ ưu tiên và Ngày */}
                              <div className="flex items-center gap-1.5 text-[12px]">
                                 {priority === 3 && !isCompleted && <span className="material-symbols-outlined text-red-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                                 {priority === 2 && !isCompleted && <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                                 {priority === 1 && !isCompleted && <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                                 
                                 {taskListId === null && isDateView && <span className={`font-medium mr-1 ml-1 ${isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>Inbox</span>}
                                 {rightLabel && <span className={`${rightLabel.color} font-medium`}>{rightLabel.text}</span>}
                              </div>

                              {/* Menu Actions (Chỉ hiện khi hover hoặc click) */}
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity relative ml-1">
                                  
                                  {/* Nút "..." Menu */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTaskMenuId(activeTaskMenuId === taskId ? null : taskId);
                                    }}
                                    className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${activeTaskMenuId === taskId ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                  </button>

                                  {/* Menu Dropdown Thêm Subtask & Xóa */}
                                  {activeTaskMenuId === taskId && (
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-lg z-50 py-1.5 overflow-hidden">
                                       <button
                                         onClick={(e) => { e.stopPropagation(); handleAddSubtask(taskId, taskListId); setActiveTaskMenuId(null); }}
                                         className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                                       >
                                         <span className="material-symbols-outlined text-[16px] text-blue-500">account_tree</span>
                                         Thêm Subtask
                                       </button>
                                       
                                       <div className="h-px bg-slate-100 my-1 mx-2" />
                                       
                                       <button
                                         onClick={(e) => { e.stopPropagation(); handleDeleteTask(taskId); setActiveTaskMenuId(null); }}
                                         className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                                       >
                                         <span className="material-symbols-outlined text-[16px]">delete</span>
                                         Xóa tác vụ
                                       </button>
                                    </div>
                                  )}

                                  {/* Nút kéo thả */}
                                  <div className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab ml-0.5">
                                      <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                                  </div>
                              </div>

                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
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