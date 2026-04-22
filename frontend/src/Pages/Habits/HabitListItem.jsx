import { useState, useEffect } from 'react';
import { habitService } from '../../api/habitService';

export default function HabitListItem({ habit, refresh, onHabitUpdated }) {
  const [completedToday, setCompletedToday] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: habit.name,
    target: habit.target,
    unit: habit.unit || '',
    type: habit.type,
    icon: habit.icon || 'fitness_center',
    color: habit.color || '#00675c'
  });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodayStatus();
    fetchStreak();
  }, [habit.id, refresh]);

  const fetchTodayStatus = async () => {
    try {
      const logs = await habitService.getLogs(habit.id, 1);
      const log = logs.data.find(l => l.date === today);
      if (habit.type === 'bool') {
        setCompletedToday(log?.value === 1);
      } else {
        setCompletedToday(log?.value >= habit.target);
      }
    } catch (err) { console.error(err); }
  };

  const fetchStreak = async () => {
    try {
      const stats = await habitService.getStats(habit.id);
      setCurrentStreak(stats.data.currentStreak);
    } catch (err) { console.error(err); }
  };

  const handleToggle = async () => {
    if (completedToday) {
      // Bỏ tick: xóa log hôm nay
      if (window.confirm(`Bỏ đánh dấu hoàn thành "${habit.name}"?`)) {
        await habitService.deleteLog(habit.id, today);
        setCompletedToday(false);
        // Cập nhật streak (giảm 1 nếu hôm qua có streak)
        // Đơn giản là fetch lại stats
        await fetchStreak();
        if (onHabitUpdated) onHabitUpdated();
      }
    } else {
      // Tick: log nhanh
      await habitService.quickLog(habit.id, today);
      setCompletedToday(true);
      await fetchStreak();
      if (onHabitUpdated) onHabitUpdated();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Xóa thói quen "${habit.name}"?`)) {
      await habitService.delete(habit.id);
      if (onHabitUpdated) onHabitUpdated();
    }
    setShowMenu(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await habitService.update(habit.id, editForm);
    setIsEditing(false);
    if (onHabitUpdated) onHabitUpdated();
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white border rounded-xl shadow-sm mb-2">
        <form onSubmit={handleUpdate} className="space-y-3">
          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <div className="flex flex-wrap gap-2">
            <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="border rounded px-3 py-2">
              <option value="bool">Yes/No</option>
              <option value="count">Số lần</option>
              <option value="duration">Thời gian (phút)</option>
            </select>
            {editForm.type !== 'bool' && (
              <input type="number" step="any" value={editForm.target} onChange={e => setEditForm({...editForm, target: parseFloat(e.target.value)})} className="border rounded px-3 py-2 w-24" placeholder="Mục tiêu" />
            )}
            {editForm.type !== 'bool' && (
              <input type="text" placeholder="Đơn vị" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} className="border rounded px-3 py-2" />
            )}
            <input type="color" value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} className="w-10 h-10 rounded border" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 rounded bg-gray-200">Hủy</button>
            <button type="submit" className="px-3 py-1 rounded bg-primary text-white">Lưu</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 group hover:bg-gray-50/50 px-3 rounded-xl transition relative">
      <div className="flex items-center gap-4 flex-1">
        <input
          type="checkbox"
          checked={completedToday}
          onChange={handleToggle}
          className="w-5 h-5 rounded-md border-2 border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-xl" style={{ color: habit.color }}>{habit.icon}</span>
            <span className="font-semibold text-gray-800">{habit.name}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {habit.type === 'bool' ? 'Yes/No' : habit.type === 'count' ? `${habit.target} ${habit.unit || ''}` : `${habit.target} min`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-bold text-primary">{currentStreak}</div>
          <div className="text-[10px] text-gray-400">streak</div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 w-32 bg-white border rounded-lg shadow-lg z-10 py-1">
              <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">✏️ Sửa</button>
              <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">🗑️ Xóa</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}