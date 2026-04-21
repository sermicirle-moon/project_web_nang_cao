import { useState } from 'react';

export default function CreateHabitModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    unit: '',
    target: 1,
    type: 'bool',
    icon: 'checklist',
    color: '#00675c'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Tạo thói quen mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tên thói quen</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-xl px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Loại</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border rounded-xl px-3 py-2">
              <option value="bool">Có / Không</option>
              <option value="count">Số lần / Số lượng</option>
              <option value="duration">Thời gian (phút)</option>
            </select>
          </div>
          {form.type !== 'bool' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Mục tiêu mỗi ngày</label>
              <input type="number" step="any" value={form.target} onChange={e => setForm({...form, target: parseFloat(e.target.value)})} className="w-full border rounded-xl px-3 py-2" required />
            </div>
          )}
          {form.type !== 'bool' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Đơn vị (cốc, lần, phút...)</label>
              <input type="text" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full border rounded-xl px-3 py-2" />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Màu sắc</label>
            <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-10 h-10 rounded border" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Hủy</button>
            <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg">Tạo</button>
          </div>
        </form>
      </div>
    </div>
  );
}