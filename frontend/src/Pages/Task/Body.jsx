// File: src/Pages/TaskManagement/Body.jsx
import { useState } from "react";

export default function Body() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [tasks, setTasks] = useState([
    { id: 1, title: "Đọc tài liệu React Router", date: "Hôm nay", priority: "text-red-500", completed: false, description: "Nhớ đọc phần Nested Routes nhé" },
    { id: 2, title: "Tập thể dục 30 phút", date: "Ngày mai", priority: "text-gray-400", completed: false, description: "" },
  ]);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Xử lý công việc
  const handleAddTask = () => {
    if (inputValue.trim() === "") return;
    const newTask = {
      id: Date.now(),
      title: inputValue,
      date: "Hôm nay", 
      priority: "text-blue-500",
      completed: false,
      description: ""
    };
    setTasks([newTask, ...tasks]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  const toggleComplete = (e, id) => {
    e.stopPropagation();
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const deleteTask = (e, id) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
    setOpenMenuId(null);
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const updateDescription = (id, newDesc) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, description: newDesc } : task
    ));
  };

  return (
    // THAY ĐỔI LỚN 1: bg-white để phủ kín nền, min-h-full để trải dài từ trên xuống
    <div className="flex w-full h-full bg-white">
      
      {/* ================= CỘT TRÁI: DANH SÁCH TASK ================= */}
      {/* THAY ĐỔI LỚN 2: Chuyển toàn bộ padding vào đây. Cột này dùng flex-1 để tự co giãn */}
      <div className="flex-1 p-6 transition-all">
        
        {/* THAY ĐỔI LỚN 3: Bỏ "mx-auto". Giờ đây khối này KHÔNG BAO GIỜ bị nhảy xê dịch */}
        <div className="max-w-3xl">
          
          <div className="mb-6 flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Hôm nay</h1>
            <span className="text-sm font-medium text-gray-400">T2, 23 thg 3</span>
          </div>

          <div className={`mb-8 bg-white border rounded-md overflow-hidden transition-all duration-200 ${isInputFocused ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-gray-300'}`}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Thêm tác vụ vào 'Hôm nay', nhấn Enter để lưu" 
              className="w-full px-4 py-3.5 outline-none text-[15px] text-gray-800 placeholder:text-gray-400"
            />
            {isInputFocused && (
              <div className="bg-[#fafafa] px-3 py-2 flex items-center justify-between border-t border-gray-100">
                <div className="flex gap-0.5">
                  <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"><span className="material-symbols-outlined text-[20px]">calendar_today</span></button>
                  <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[20px]">flag</span></button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsInputFocused(false)} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors">Hủy</button>
                  <button onClick={handleAddTask} className="bg-primary text-white text-sm font-bold px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors">Thêm</button>
                </div>
              </div>
            )}
          </div>

          {/* Danh sách Task */}
          <div className="flex flex-col">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTaskId(task.id)}
                className={`group flex items-center gap-3 py-3 border-b border-gray-100 hover:bg-[#fafafa] transition-colors cursor-pointer px-2 -mx-2 rounded-md ${
                  selectedTaskId === task.id ? "bg-blue-50/50" : ""
                }`}
              >
                <button 
                  onClick={(e) => toggleComplete(e, task.id)}
                  className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.completed ? "bg-gray-400 border-gray-400" : "border-gray-300 hover:border-primary"
                  }`}
                >
                  {task.completed && <span className="material-symbols-outlined text-[14px] text-white font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                </button>

                <div className="flex-1 flex items-center gap-3">
                  <span className={`text-[15px] font-medium transition-all ${task.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                    {task.title}
                  </span>
                  {!task.completed && (
                    <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                      <span className={`material-symbols-outlined text-[14px] ${task.priority}`} style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                      {task.date}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={(e) => toggleMenu(e, task.id)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                      openMenuId === task.id ? "bg-gray-200 text-gray-800 opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                  </button>

                  {openMenuId === task.id && (
                    <div className="absolute right-0 top-10 w-44 bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50">
                      <button className="w-full text-left px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3"><span className="material-symbols-outlined text-[18px] text-gray-400">calendar_today</span> Đặt ngày</button>
                      <hr className="my-1.5 border-gray-100" />
                      <button onClick={(e) => deleteTask(e, task.id)} className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">delete</span> Xóa tác vụ</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================= CỘT PHẢI: CHI TIẾT TASK (DETAIL) ================= */}
      {/* THAY ĐỔI LỚN 4: Chiếm toàn bộ không gian từ mép trên tới mép dưới nhờ min-h-[calc(100vh-80px)] */}
      {selectedTask && (
        <div className="w-[360px] xl:w-[420px] bg-[#fafafa] border-l border-gray-200 flex flex-col sticky top-0 min-h-[calc(100vh-80px)] shrink-0 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10 transition-transform duration-300">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
            <span className="font-bold text-gray-800">Chi tiết tác vụ</span>
            <button 
              onClick={() => setSelectedTaskId(null)} 
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="bg-white px-5 py-6 border-b border-gray-100">
            <input 
              type="text" 
              value={selectedTask.title} 
              readOnly
              className="w-full text-lg font-bold text-gray-800 outline-none mb-6 border-transparent border-b pb-1"
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Dự án</span>
                <button className="text-sm font-medium text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1">Zentask <span className="material-symbols-outlined text-[16px]">expand_more</span></button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Ngày hết hạn</span>
                <button className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1">{selectedTask.date} <span className="material-symbols-outlined text-[16px]">calendar_today</span></button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Mức độ ưu tiên</span>
                <button className="text-sm font-medium text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1">Cao <span className="material-symbols-outlined text-[16px]">flag</span></button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-5 bg-[#fafafa]">
            <textarea 
              placeholder="Thêm mô tả..." 
              value={selectedTask.description || ""}
              onChange={(e) => updateDescription(selectedTask.id, e.target.value)}
              className="w-full h-32 bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-gray-400 transition-all shadow-sm"
            ></textarea>
            <div className="mt-3 flex justify-end">
              <button className="bg-white border border-gray-300 text-gray-700 font-medium text-sm px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                Lưu
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}