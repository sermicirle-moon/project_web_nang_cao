import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { taskService } from "../../api/taskService";
import api from "../../api/api"; 
import TaskInput from "./Components/TaskInput";
import TaskDetail from "./Components/TaskDetail";

const FILTER_NAMES = { inbox: 'Hộp thư đến', today: 'Hôm nay', next7days: '7 Ngày tới', completed: 'Đã hoàn thành', blocked: 'Không làm', trash: 'Thùng rác' };
const getShortWeekday = (date) => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
const formatTickTickHeaderDate = (date) => `${getShortWeekday(date)}, ${date.getDate()} Thg ${date.getMonth() + 1}`;

export default function Body() {
  const { listId } = useParams(); 
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDetailData, setTaskDetailData] = useState(null); 
  
  const [collapsedSections, setCollapsedSections] = useState({});
  const [activeTaskMenuId, setActiveTaskMenuId] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});

  const [availableLists, setAvailableLists] = useState([]);
  const [showMoveMenuFor, setShowMoveMenuFor] = useState(null);
  
  const moveMenuTimeoutRef = useRef(null);

  const listNameDisplay = FILTER_NAMES[listId] || location.state?.name || "Danh sách tác vụ";
  const isReadOnlyView = ['completed', 'blocked', 'trash'].includes(listId);
  const isDateView = listId === 'today' || listId === 'next7days';

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveTaskMenuId(null);
      setShowMoveMenuFor(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAvailableLists = async () => {
        try {
            const res = await api.get('/tasklists/sidebar');
            const standalone = res.data.standAloneLists || [];
            const folderLists = (res.data.folders || []).flatMap(f => f.lists || []);
            setAvailableLists([...standalone, ...folderLists]);
        } catch (err) {
            console.error("Lỗi lấy danh sách thư mục:", err);
        }
    };
    fetchAvailableLists();
  }, []);

  const fetchTasks = async () => {
    if (!listId) return;
    setTasks([]); 
    setIsLoading(true);
    try {
      let res;
      if (listId.startsWith('tag-')) res = await taskService.getTasksByTag(parseInt(listId.replace('tag-', ''), 10));
      else if (!isNaN(parseInt(listId, 10))) res = await taskService.getTasksByList(parseInt(listId, 10));
      else res = await taskService.getTasksByFilter(listId);
      setTasks(res.data);
    } catch (err) { console.error("Lỗi:", err); } 
    finally { setIsLoading(false); }
  };

  const fetchDetailTask = async (id) => {
    try {
      const res = await api.get(`/taskitem/${id}`);
      setTaskDetailData(res.data);
    } catch (err) { console.error("Lỗi:", err); }
  };

  useEffect(() => {
    if (selectedTaskId) fetchDetailTask(selectedTaskId);
    else setTaskDetailData(null);
  }, [selectedTaskId]);

  useEffect(() => {
    fetchTasks();
    setSelectedTaskId(null); 
    setCollapsedSections({});
    setActiveTaskMenuId(null);
    setShowMoveMenuFor(null);
  }, [listId]);

  const handleMouseEnterMove = (taskId) => {
      if (moveMenuTimeoutRef.current) clearTimeout(moveMenuTimeoutRef.current);
      setShowMoveMenuFor(taskId);
  };

  const handleMouseLeaveMove = () => {
      moveMenuTimeoutRef.current = setTimeout(() => {
          setShowMoveMenuFor(null);
      }, 300); 
  };

  const toggleSection = (sectionId) => setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  const toggleTaskExpand = (e, taskId) => { e.stopPropagation(); setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] })); };

  const handleAddTask = async (taskPayload) => {
    let finalPayload = { ...taskPayload };
    if (listId.startsWith('tag-')) {
      finalPayload.tagIds = [...(finalPayload.tagIds || []), parseInt(listId.replace('tag-', ''), 10)];
      finalPayload.taskListId = null;
    } else if (finalPayload.taskListId === undefined) {
      finalPayload.taskListId = !isNaN(parseInt(listId, 10)) ? parseInt(listId, 10) : null;
    }

    try {
      const res = await taskService.create(finalPayload);
      if (res.data && (res.data.id || res.data.Id)) {
         setTasks([res.data, ...tasks]); 
         if (finalPayload.parentTaskId) {
             setExpandedTasks(prev => ({ ...prev, [finalPayload.parentTaskId]: true }));
             if (selectedTaskId === finalPayload.parentTaskId) fetchDetailTask(finalPayload.parentTaskId);
         }
      } else fetchTasks();
    } catch (err) { alert("Lỗi thêm."); }
  };

  const handleAddSubtask = (parentTask) => {
    const subtaskTitle = window.prompt("Nhập tên Subtask mới:");
    if (subtaskTitle && subtaskTitle.trim()) {
      handleAddTask({ 
        title: subtaskTitle.trim(), 
        parentTaskId: parentTask.id || parentTask.Id, 
        taskListId: parentTask.taskListId !== undefined ? parentTask.taskListId : parentTask.TaskListId,
        startDate: parentTask.startDate || parentTask.StartDate, 
        dueDate: parentTask.dueDate || parentTask.DueDate        
      });
    }
  };

  const handleMoveTask = async (taskId, targetListId) => {
    try {
      await api.patch(`/taskitem/${taskId}/move`, { taskListId: targetListId });
      fetchTasks(); 
      setActiveTaskMenuId(null);
      setShowMoveMenuFor(null);
    } catch (err) {
      alert("Lỗi khi chuyển danh sách.");
    }
  };

  const handleToggle = async (e, task) => {
    e.stopPropagation();
    const taskId = task.id || task.Id;
    const currentStatus = task.isCompleted !== undefined ? task.isCompleted : task.IsCompleted;
    setTasks(tasks.map(t => ((t.id || t.Id) === taskId ? { ...t, isCompleted: !currentStatus, IsCompleted: !currentStatus } : t)));
    try { await taskService.toggleComplete(taskId); fetchTasks(); } catch (err) { fetchTasks(); }
  };

  const handleDeleteTask = async (taskId) => {
    try { await taskService.delete(taskId); fetchTasks(); if (selectedTaskId === taskId) setSelectedTaskId(null); } catch (e) { alert("Lỗi xóa."); }
  };
  const handleHardDeleteTask = async (taskId) => {
    if (window.confirm("Xóa vĩnh viễn?")) { try { await taskService.hardDelete(taskId); fetchTasks(); } catch (e) { alert("Lỗi."); } }
  };
  const handleRestoreTask = async (taskId) => {
    try { await taskService.restore(taskId); fetchTasks(); } catch (e) { alert("Lỗi."); }
  };
  const handleEmptyTrash = async () => {
    if (window.confirm("Dọn sạch?")) { try { await taskService.emptyTrash(); setTasks([]); } catch (e) { alert("Lỗi."); } }
  };
  const handleToggleWontDo = async (taskId) => {
    try { await taskService.toggleWontDo(taskId); fetchTasks(); } catch (e) { alert("Lỗi."); }
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
    const sDate = new Date(sDateStr); const dDate = new Date(dDateStr || sDateStr);
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

    const parentTasksList = tasks.filter(t => {
        const pId = t.parentTaskId || t.ParentTaskId;
        if (!pId) return true;
        const parentInList = tasks.some(parent => (parent.id || parent.Id) === pId);
        return !parentInList; 
    });

    if (!isDateView) {
      const active = parentTasksList.filter(t => !(t.isCompleted || t.IsCompleted)).sort((a,b) => sortFn(a,b));
      const completed = parentTasksList.filter(t => (t.isCompleted || t.IsCompleted)).sort((a,b) => sortFn(a,b, true));
      return [
        ...(active.length > 0 ? [{ id: 'active', label: '', hideHeader: true, tasks: active }] : []),
        ...(completed.length > 0 ? [{ id: 'completed', label: 'Đã hoàn thành', color: 'text-slate-500', tasks: completed }] : [])
      ];
    }

    const now = new Date(); now.setHours(0,0,0,0);
    const groups = { overdue: { label: 'Quá hạn', color: 'text-rose-600', tasks: [] }, today: { label: `${getShortWeekday(now)}, Hôm nay`, color: 'text-slate-800', tasks: [] }, upcoming: {}, noDate: { label: 'Chưa lên lịch', color: 'text-slate-500', tasks: [] }, completed: { label: 'Đã hoàn thành', color: 'text-slate-500', tasks: [] } };

    parentTasksList.forEach(task => {
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

  const getRightSideDateLabel = (dateString, isCompleted, isBlocked) => {
    if (!dateString) return null;
    const dueDate = new Date(dateString); dueDate.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
    let text = diff < -1 ? `${dueDate.getDate()} Thg ${dueDate.getMonth() + 1}` : diff === -1 ? 'Hôm qua' : diff === 0 ? 'Hôm nay' : diff === 1 ? 'Ngày mai' : getShortWeekday(dueDate);
    return { text, color: (isCompleted || isBlocked) ? 'text-slate-400' : (diff < 0 ? 'text-rose-500' : diff === 0 ? 'text-blue-500' : 'text-slate-500') };
  };

  const renderTaskTree = (task) => {
    const taskId = task.id || task.Id;
    const isCompleted = task.isCompleted || task.IsCompleted;
    const isBlocked = listId === 'blocked';
    const rightLabel = getRightSideDateLabel(task.dueDate || task.DueDate, isCompleted, isBlocked);
    const durationText = renderDuration(task);
    const taskListId = task.taskListId !== undefined ? task.taskListId : task.TaskListId;
    const priority = task.priority || task.Priority || 0;

    const subtasks = tasks.filter(t => (t.parentTaskId || t.ParentTaskId) === taskId);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks[taskId];
    const isMenuActive = activeTaskMenuId === taskId;
    const isSelected = selectedTaskId === taskId;

    // HIỂU ỨNG TÊN TASK KHI ĐƯỢC CHỌN (Tăng đậm và đổi màu xanh nếu chưa hoàn thành)
    const titleColorClass = (isCompleted || isBlocked) 
        ? "text-slate-400 line-through" 
        : isSelected 
            ? "text-blue-900 font-semibold" 
            : "text-slate-800";

    return (
      <div key={`tree-${taskId}`} className={`flex flex-col w-full relative ${isMenuActive ? 'z-50' : 'z-10'}`}>
          {/* ✅ NÂNG CẤP CSS CHO TỪNG DÒNG TASK: Bo góc, viền, đổ bóng, hover khác biệt hoàn toàn */}
          <div 
            onClick={() => setSelectedTaskId(taskId)} 
            className={`group flex items-center py-2.5 px-3 mb-1 cursor-pointer rounded-xl transition-all duration-200 border
              ${isSelected 
                  ? "bg-blue-50/80 border-blue-300 shadow-[0_2px_8px_-2px_rgba(59,130,246,0.3)] ring-1 ring-blue-100" 
                  : "bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200 hover:shadow-sm"
              }`}
          >
              
              {hasSubtasks ? (
                  <button onClick={(e) => toggleTaskExpand(e, taskId)} className="w-5 h-5 flex items-center justify-center mr-1 text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                      <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>chevron_right</span>
                  </button>
              ) : (
                  <div className="w-5 mr-1 shrink-0" />
              )}

              <div className="shrink-0 w-8 flex items-center">
                  {listId !== 'trash' && !isBlocked && (
                      <button onClick={(e) => handleToggle(e, task)} className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all ${getPriorityClasses(priority, isCompleted)}`}>
                      {isCompleted && <span className="material-symbols-outlined text-white text-[13px] font-bold">check</span>}
                      </button>
                  )}
                  {(listId === 'trash' || isBlocked) && <span className="material-symbols-outlined text-slate-300 text-[18px]">{isBlocked ? 'block' : 'delete'}</span>}
              </div>

              <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
                  <p className={`text-[14px] truncate transition-colors ${titleColorClass}`}>{task.title || task.Title}</p>
                  {durationText && (
                      <span className={`text-[11.5px] font-medium flex items-center gap-1 mt-0.5 ${(isCompleted || isBlocked) ? 'text-slate-300 line-through' : 'text-slate-500'}`}>
                      <span className={`material-symbols-outlined text-[13px] ${(isCompleted || isBlocked) ? 'text-slate-300' : 'text-blue-500'}`}>schedule</span> {durationText}
                      </span>
                  )}
              </div>

              <div className="flex items-center justify-end shrink-0 gap-2 pl-3">
                  <div className="flex items-center gap-1.5 text-[12px]">
                      {priority === 3 && !isCompleted && !isBlocked && <span className="material-symbols-outlined text-red-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                      {priority === 2 && !isCompleted && !isBlocked && <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                      {priority === 1 && !isCompleted && !isBlocked && <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                      {taskListId === null && isDateView && <span className={`font-medium mr-1 ml-1 ${(isCompleted || isBlocked) ? 'text-slate-300' : 'text-slate-400'}`}>Inbox</span>}
                      {rightLabel && <span className={`${rightLabel.color} font-medium`}>{rightLabel.text}</span>}
                  </div>

                  {/* Nút hành động Menu (...) */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity relative ml-1">
                      <button onClick={(e) => { e.stopPropagation(); setActiveTaskMenuId(isMenuActive ? null : taskId); }} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${isMenuActive ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm'}`}>
                          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>

                      {isMenuActive && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-lg z-50 py-1.5">
                              {listId === 'trash' ? (
                              <>
                                  <button onClick={(e) => { e.stopPropagation(); handleRestoreTask(taskId); setActiveTaskMenuId(null); }} className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-green-50 text-green-600 flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-[16px]">restore_from_trash</span> Khôi phục</button>
                                  <div className="h-px bg-slate-100 my-1 mx-2" />
                                  <button onClick={(e) => { e.stopPropagation(); handleHardDeleteTask(taskId); setActiveTaskMenuId(null); }} className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-[16px]">delete_forever</span> Xóa vĩnh viễn</button>
                              </>
                              ) : (
                              <>
                                  <button onClick={(e) => { e.stopPropagation(); handleAddSubtask(task); setActiveTaskMenuId(null); }} className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-[16px] text-blue-500">account_tree</span> Thêm Subtask</button>
                                  
                                  <div className="relative" onMouseEnter={() => handleMouseEnterMove(taskId)} onMouseLeave={handleMouseLeaveMove}>
                                      <button className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors">
                                          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-indigo-500">drive_file_move</span> Chuyển đến</div>
                                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                      </button>
                                      
                                      {showMoveMenuFor === taskId && (
                                          <div className="absolute right-[96%] top-[-10px] w-48 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-lg z-50 py-1.5 overflow-hidden">
                                              <button onClick={(e) => { e.stopPropagation(); handleMoveTask(taskId, null); }} className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-blue-50 text-blue-600 flex items-center gap-2 ${taskListId === null ? 'bg-blue-50' : ''}`}>
                                                  <span className="material-symbols-outlined text-[16px]">inbox</span> Hộp thư đến
                                              </button>
                                              <div className="h-px bg-slate-100 my-1 mx-2" />
                                              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                  {availableLists.map(l => (
                                                      <button key={l.id} onClick={(e) => { e.stopPropagation(); handleMoveTask(taskId, l.id); }} className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-slate-50 text-slate-700 flex items-center gap-2 ${taskListId === l.id ? 'bg-slate-50' : ''}`}>
                                                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color || '#cbd5e1' }}></span>
                                                          <span className="truncate">{l.name}</span>
                                                      </button>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                  </div>

                                  <button onClick={(e) => { e.stopPropagation(); handleToggleWontDo(taskId); setActiveTaskMenuId(null); }} className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-orange-50 text-orange-500 flex items-center gap-2 transition-colors`}><span className="material-symbols-outlined text-[16px]">{listId === 'blocked' ? 'undo' : 'block'}</span> {listId === 'blocked' ? 'Tiếp tục làm' : 'Không làm'}</button>
                                  <div className="h-px bg-slate-100 my-1 mx-2" />
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(taskId); setActiveTaskMenuId(null); }} className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span> Xóa tác vụ</button>
                              </>
                              )}
                          </div>
                      )}
                      <div className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab ml-0.5"><span className="material-symbols-outlined text-[18px]">drag_indicator</span></div>
                  </div>
              </div>
          </div>

          {/* Đệ quy subtasks: Thụt lề và giãn cách */}
          {hasSubtasks && isExpanded && (
              <div className="flex flex-col ml-8 pl-2 border-l-2 border-slate-100 mb-1 mt-1">
                  {subtasks.map(st => renderTaskTree(st))}
              </div>
          )}
      </div>
    )
  }

  const groupedSections = getGroupedTasks();

  return (
    <div className="flex w-full h-full bg-white overflow-hidden">
      <div className="flex-1 px-8 py-8 overflow-y-auto custom-scrollbar scroll-smooth">
        <div className="w-full">
          <div className="mb-6 flex items-end justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold text-slate-800 tracking-tight leading-none">{listNameDisplay}</h1>
              <span className="text-[12px] font-semibold text-slate-400 mt-1">{new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            {listId === 'trash' && tasks.length > 0 && (
               <button onClick={handleEmptyTrash} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-[13px] font-semibold transition-colors">
                 <span className="material-symbols-outlined text-[18px]">delete_sweep</span> Dọn sạch
               </button>
            )}
          </div>

          <TaskInput listId={listId} isReadOnlyView={isReadOnlyView} onAddTask={handleAddTask} />

          <div className="flex flex-col w-full pb-10">
            {isLoading ? (
               <div className="py-12 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div></div>
            ) : tasks.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
                 <span className="material-symbols-outlined text-[64px] mb-2 opacity-20">{listId === 'trash' ? 'delete' : 'task'}</span>
                 <h3 className="text-[15px] font-bold">Danh sách trống</h3>
               </div>
            ) : (
              groupedSections.map((section) => (
                <div key={section.id} className="mb-6">
                  {!section.hideHeader && (
                    <div className="flex items-center gap-1.5 mb-3 px-1 border-b border-slate-50 pb-1.5 cursor-pointer select-none" onClick={() => toggleSection(section.id)}>
                      <span className={`material-symbols-outlined text-[18px] transition-transform ${section.color} ${collapsedSections[section.id] ? '-rotate-90' : ''}`}>expand_more</span>
                      <h3 className={`text-[13px] font-bold tracking-wide ${section.color}`}>{section.label}</h3>
                      <span className="text-[11px] font-bold text-slate-300 ml-1">{section.tasks.length}</span>
                    </div>
                  )}
                  
                  {!collapsedSections[section.id] && (
                    <div className="flex flex-col pl-1 pr-1 animate-in fade-in duration-200">
                      {section.tasks.map((parentTask) => renderTaskTree(parentTask))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <TaskDetail 
        task={taskDetailData} 
        onClose={() => setSelectedTaskId(null)} 
        listNameDisplay={listNameDisplay} 
        availableLists={availableLists}
        onTaskUpdated={(updatedTaskId) => {
           fetchTasks(); 
           if (updatedTaskId) {
               fetchDetailTask(updatedTaskId);
           } else {
               setSelectedTaskId(null);
           }
        }}
      />
    </div>
  );
}