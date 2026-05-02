// src/Pages/Eisenhower/Eisenhower.jsx
import { useState, useEffect } from "react";
import { eisenhowerService } from "../../api/eisenhowerService";

export default function Eisenhower() {
  const [tasks, setTasks] = useState({ do: [], schedule: [], delegate: [], eliminate: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(null); // null, 'red', 'blue', 'yellow', 'gray'
  const [menuOpenForTask, setMenuOpenForTask] = useState(null);

  // Mapping từ màu sang (urgent, important)
  const priorityMap = {
    red: { urgent: true, important: true, label: "Urgent & Important", quadrant: "do" },
    blue: { urgent: true, important: false, label: "Urgent, Not Important", quadrant: "delegate" },
    yellow: { urgent: false, important: true, label: "Important, Not Urgent", quadrant: "schedule" },
    gray: { urgent: false, important: false, label: "Not Urgent & Not Important", quadrant: "eliminate" },
  };

  // Màu sắc cho các nút
  const priorityColors = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-500 text-white",
    gray: "bg-gray-400 text-white",
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await eisenhowerService.getAll();
      const grouped = { do: [], schedule: [], delegate: [], eliminate: [] };
      
      const pureTasks = res.data.filter(task => {
         // Backend cũ của bạn có thể trả về 'Type' (viết hoa) hoặc 'type' (viết thường)
         const itemType = task.type !== undefined ? task.type : (task.Type || 0);
         return itemType === 0; 
      });
      
      pureTasks.forEach((task) => {
            const quadrant = task.important && task.urgent ? "do" :
                             task.important && !task.urgent ? "schedule" :
                             !task.important && task.urgent ? "delegate" : "eliminate";
            grouped[quadrant].push(task);
        });
        
        for (const key in grouped) {
            grouped[key].sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? 1 : -1);
        }
      setTasks(grouped);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu Eisenhower:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    if (!selectedPriority) {
      alert("Vui lòng chọn mức độ ưu tiên (cờ)");
      return;
    }
    const { urgent, important } = priorityMap[selectedPriority];
    try {
      await eisenhowerService.create({
        title: newTaskTitle,
        urgent,
        important,
      });
      setShowModal(false);
      setNewTaskTitle("");
      setSelectedPriority(null);
      await fetchTasks();
    } catch (err) {
      alert("Lỗi tạo task");
    }
  };

  const updateTaskPriority = async (task, color) => {
    const { urgent, important } = priorityMap[color];
    try {
      const updatedTask = {
        ...task,
        urgent,
        important,
        isCompleted: task.isCompleted,
        isDeleted: task.isDeleted
      };
      await eisenhowerService.update(task.id, updatedTask);
      await fetchTasks();
    } catch (err) {
      alert("Lỗi cập nhật");
    }
    setMenuOpenForTask(null);
  };

  const toggleComplete = async (task) => {
    try {
      const updatedTask = {
        ...task,
        isCompleted: !task.isCompleted
      };
      await eisenhowerService.update(task.id, updatedTask);
      fetchTasks();
    } catch (err) {
      alert("Lỗi cập nhật");
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm("Xóa task này?")) {
      try {
        await eisenhowerService.delete(id);
        await fetchTasks();
      } catch (err) {
        alert("Lỗi xóa");
      }
    }
  };

  const getCurrentColor = (task) => {
    if (task.urgent && task.important) return "red";
    if (task.urgent && !task.important) return "blue";
    if (!task.urgent && task.important) return "yellow";
    return "gray";
  };

  const Quadrant = ({ title, items, bgColor, actionHint }) => (
    <div className={`p-4 rounded-2xl ${bgColor} shadow-md flex flex-col h-full`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className="text-sm bg-white/50 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="text-xs text-gray-600 mb-3 italic">{actionHint}</div>
      <ul className="space-y-3 flex-1">
        {items.map((item) => {
          const currentColor = getCurrentColor(item);
          return (
            <li key={item.id} className="bg-white/80 p-3 rounded-xl shadow-sm group relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={item.isCompleted || false}
                    onChange={() => toggleComplete(item)}
                    className="w-4 h-4 rounded"
                  />
                  <p
                    className={`font-medium ${
                      item.isCompleted ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpenForTask(menuOpenForTask === item.id ? null : item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${priorityColors[currentColor]} hover:scale-110 transition`}
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">flag</span>
                  </button>
                  {menuOpenForTask === item.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 flex flex-col gap-1 p-1 w-36">
                      {Object.entries(priorityMap).map(([color, { label }]) => (
                        <button
                          key={color}
                          onClick={() => updateTaskPriority(item, color)}
                          className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${priorityColors[color]} hover:opacity-80 transition`}
                        >
                          <span className="material-symbols-outlined text-white text-[16px]">flag</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(item.id)}
                  className="text-red-500 opacity-0 group-hover:opacity-100 transition ml-2"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="text-center text-gray-400 text-sm py-4">Không có task</li>
        )}
      </ul>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Eisenhower Matrix</h1>
          <p className="text-sm text-gray-500">
            Phân loại công việc theo mức độ khẩn cấp và quan trọng
          </p>
          <br />
        </div>
        <div
          onClick={() => setShowModal(true)}
          className="bg-white rounded-xl shadow-md p-4 flex items-center gap-2 cursor-pointer hover:shadow-lg transition border-2 border-dashed border-gray-300"
        >
          <span className="material-symbols-outlined text-gray-400">add</span>
          <span className="text-gray-500">Thêm task mới...</span>
        </div>
      </div>

      {/* Modal thêm task với các nút cờ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Thêm task mới</h3>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Tên task"
              className="w-full border rounded-lg px-4 py-2 mb-4"
              autoFocus
            />
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Chọn mức độ ưu tiên (cờ):</p>
              <div className="flex gap-3">
                {Object.entries(priorityMap).map(([color, { label }]) => (
                  <button
                    key={color}
                    onClick={() => setSelectedPriority(color)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${priorityColors[color]} ${
                      selectedPriority === color ? "ring-2 ring-offset-2 ring-blue-500" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined text-white text-[20px]">flag</span>
                  </button>
                ))}
              </div>
              {selectedPriority && (
                <p className="text-xs text-gray-500 mt-2">{priorityMap[selectedPriority].label}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Hủy
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrant
          title="Làm ngay (Urgent & Important)"
          items={tasks.do}
          bgColor="bg-red-100"
          actionHint="⚡ Do"
        />
        <Quadrant
          title="Lên lịch (Important, Not Urgent)"
          items={tasks.schedule}
          bgColor="bg-yellow-100"
          actionHint="📅 Schedule"
        />
        <Quadrant
          title="Ủy quyền (Urgent, Not Important)"
          items={tasks.delegate}
          bgColor="bg-blue-100"
          actionHint="🤝 Delegate"
        />
        <Quadrant
          title="Không quan trọng (Not Urgent & Not Important)"
          items={tasks.eliminate}
          bgColor="bg-gray-100"
          actionHint="🗑️ Eliminate"
        />
      </div>
    </div>
  );
}