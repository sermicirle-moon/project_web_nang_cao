// src/Pages/Habits/Index.jsx
import { useState, useEffect } from 'react';
import { habitService } from '../../api/habitService';
import HabitList from './HabitList';
import StatsSidebar from './StatsSidebar';
import CreateHabitModal from './CreateHabitModal';
import { useAuth } from '../../context/AuthContext';

export default function HabitsIndex() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchHabits();
  }, [token, refreshFlag]);

  const fetchHabits = async () => {
    try {
      const res = await habitService.getAll();
      setHabits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (habitData) => {
    try {
      await habitService.create(habitData);
      setShowModal(false);
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      alert('Lỗi tạo thói quen');
    }
  };
  const handleHabitUpdated = () => {
    setRefreshFlag(prev => prev + 1);
  };
  const handleToggle = async (habitId, date) => {
    try {
      await habitService.quickLog(habitId, date);
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      alert('Lỗi cập nhật thói quen');
    }
  };
  
  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Habit</h1>
          <p className="text-sm text-gray-500">Track Precision • PRECISION CARDS SYSTEM</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Habit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: danh sách habit (chiếm 2/3) */}
        <div className="lg:col-span-2">
          <HabitList habits={habits} onToggle={handleToggle} refresh={refreshFlag} onHabitUpdated={handleHabitUpdated} />
        </div>

        {/* Cột phải: thống kê */}
        <div className="lg:col-span-1">
          <StatsSidebar habits={habits} refreshFlag={refreshFlag} />
        </div>
      </div>

      <CreateHabitModal isOpen={showModal} onClose={() => setShowModal(false)} onCreate={handleCreate} />
    </div>
  );
}