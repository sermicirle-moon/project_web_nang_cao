import HabitListItem from './HabitListItem';

export default function HabitList({ habits, refresh, onHabitUpdated }) {
  if (!habits.length) {
    return <div className="text-center py-12 text-gray-400">Chưa có thói quen nào. Hãy tạo thói quen đầu tiên!</div>;
  }
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                <h2 className="font-bold text-gray-700">Daily Habits</h2>
                <p className="text-xs text-gray-400 mt-0.5">Keep the momentum.</p>
            </div>
            <div className="divide-y divide-gray-100">
                {habits.map(habit => (
                <HabitListItem key={habit.id} habit={habit} refresh={refresh} onHabitUpdated={onHabitUpdated} />
                ))}
            </div>
        </div>
    );
}