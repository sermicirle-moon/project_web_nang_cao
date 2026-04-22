import { useState, useEffect } from "react";
import { eisenhowerService } from "../../api/eisenhowerService";

export default function Eisenhower() {
  const [tasks, setTasks] = useState({ do: [], schedule: [], delegate: [], eliminate: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);
  const [newTaskImportant, setNewTaskImportant] = useState(false);
  const [newTaskDue, setNewTaskDue] = useState("");

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await eisenhowerService.getAll();
      const grouped = { do: [], schedule: [], delegate: [], eliminate: [] };
      res.data.forEach(task => {
        grouped[task.quadrant.toLowerCase()].push(task);
      });
      setTasks(grouped);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await eisenhowerService.create({
        title: newTaskTitle,
        dueDate: newTaskDue || null,
        urgent: newTaskUrgent,
        important: newTaskImportant
      });
      setNewTaskTitle("");
      setNewTaskUrgent(false);
      setNewTaskImportant(false);
      setNewTaskDue("");
      setShowModal(false);
      await fetchTasks();
    } catch (err) { alert("Lỗi tạo task"); }
  };

  const deleteTask = async (quadrant, taskId) => {
    if (window.confirm("Xóa task này?")) {
      await eisenhowerService.delete(taskId);
      await fetchTasks();
    }
  };

  const Quadrant = ({ title, items, bgColor, actionHint, quadrantKey }) => (
    <div className={`p-4 rounded-2xl ${bgColor} shadow-md flex flex-col h-full`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className="text-sm bg-white/50 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="text-xs text-gray-600 mb-3 italic">{actionHint}</div>
      <ul className="space-y-3 flex-1">
        {items.map(item => (
          <li key={item.id} className="bg-white/80 p-3 rounded-xl shadow-sm group relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.dueDate || "No deadline"}</p>
              </div>
              <button onClick={() => deleteTask(quadrantKey, item.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition">✕</button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="text-center text-gray-400 text-sm py-4">Không có task</li>}
      </ul>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (

    <div className="p-6 max-w-7xl mx-auto">
      {/* Thanh thêm task - chỉ một thanh */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Eisenhower Matrix</h1>
          <p className="text-sm text-gray-500">Phân loại công việc theo mức độ khẩn cấp và quan trọng</p>
        <br></br>
        </div>
        <div 
          onClick={() => setShowModal(true)}
          className="bg-white rounded-xl shadow-md p-4 flex items-center gap-2 cursor-pointer hover:shadow-lg transition border-2 border-dashed border-gray-300"
        >
          <span className="material-symbols-outlined text-gray-400">add</span>
          <span className="text-gray-500">Thêm task mới...</span>
        </div>
      </div>

      {/* Modal chọn Urgent/Important */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Thêm task mới</h3>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Tên task"
              className="w-full border rounded-lg px-4 py-2 mb-4"
              autoFocus
            />
            <input
              type="text"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              placeholder="Hạn chót (VD: Today 5PM)"
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newTaskUrgent} onChange={(e) => setNewTaskUrgent(e.target.checked)} />
                <span>Khẩn cấp (Urgent)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newTaskImportant} onChange={(e) => setNewTaskImportant(e.target.checked)} />
                <span>Quan trọng (Important)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={handleAddTask} className="px-4 py-2 rounded-lg bg-primary text-white">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Quadrant với tên mới */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrant title="Urgent & Important" items={tasks.do} bgColor="bg-red-100" actionHint="⚡ Làm ngay" quadrantKey="do" />
        <Quadrant title="Not Urgent & Important" items={tasks.schedule} bgColor="bg-blue-100" actionHint="📅 Sẽ làm" quadrantKey="schedule" />
        <Quadrant title="Urgent & Not Important" items={tasks.delegate} bgColor="bg-yellow-100" actionHint="🤝 Làm sau" quadrantKey="delegate" />
        <Quadrant title="Not Urgent & Not Important" items={tasks.eliminate} bgColor="bg-gray-100" actionHint="🗑️ Không quan trọng" quadrantKey="eliminate" />
      </div>
    </div>
  );
}