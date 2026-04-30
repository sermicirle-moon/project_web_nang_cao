import { useState } from 'react';

export default function EisenhowerTaskInput({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      priority,
      urgent,
      important
    });
    // Reset form
    setTitle('');
    setDescription('');
    setStartDate('');
    setDueDate('');
    setPriority(0);
    setUrgent(false);
    setImportant(false);
    setIsExpanded(false);
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center px-4 py-3">
        <span className="material-symbols-outlined text-gray-400 mr-2">add</span>
        <input
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          placeholder="Thêm task mới vào ma trận..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </div>
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
          <textarea
            placeholder="Mô tả (không bắt buộc)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          />
          <div className="flex flex-wrap gap-3">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Bắt đầu" />
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Kết thúc" />
            <select value={priority} onChange={e => setPriority(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
              <option value={0}>Ưu tiên thường</option>
              <option value={1}>Thấp</option>
              <option value={2}>Trung bình</option>
              <option value={3}>Cao</option>
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} /> Khẩn cấp (Urgent)
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={important} onChange={e => setImportant(e.target.checked)} /> Quan trọng (Important)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsExpanded(false)} className="px-3 py-1 text-gray-500 hover:bg-gray-200 rounded">Hủy</button>
            <button onClick={handleSave} className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Thêm</button>
          </div>
        </div>
      )}
    </div>
  );
}