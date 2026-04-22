import { useEffect, useState } from 'react';
import { habitService } from '../../api/habitService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatsSidebar({ habits, refreshFlag }) {
  const [overallStats, setOverallStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    completionRate: 0,
    consistencyData: []
  });

  useEffect(() => {
    if (habits.length === 0) return;
    calculateOverallStats();
  }, [habits, refreshFlag]);

  const calculateOverallStats = async () => {
    let totalCurrentStreak = 0;
    let totalBestStreak = 0;
    let totalCompletedToday = 0;
    const today = new Date().toISOString().split('T')[0];
    const last30Days = [];

    // Lấy logs 30 ngày cho mỗi habit (tối ưu bằng Promise.all)
    const habitsWithLogs = await Promise.all(
      habits.map(async (habit) => {
        const statsRes = await habitService.getStats(habit.id);
        const logsRes = await habitService.getLogs(habit.id, 30);
        return { habit, stats: statsRes.data, logs: logsRes.data };
      })
    );

    // Tính tổng streak (lấy max của từng habit)
    totalCurrentStreak = Math.max(...habitsWithLogs.map(h => h.stats.currentStreak), 0);
    totalBestStreak = Math.max(...habitsWithLogs.map(h => h.stats.bestStreak), 0);

    // Tỉ lệ hoàn thành hôm nay
    for (const { habit, logs } of habitsWithLogs) {
      const todayLog = logs.find(l => l.date === today);
      if (habit.type === 'bool') {
        if (todayLog?.value === 1) totalCompletedToday++;
      } else {
        if (todayLog?.value >= habit.target) totalCompletedToday++;
      }
    }
    const completionRate = habits.length ? (totalCompletedToday / habits.length) * 100 : 0;

    // Dữ liệu consistency: tổng số habit hoàn thành mỗi ngày trong 30 ngày qua
    const dateMap = new Map();
    const todayDate = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }

    for (const { habit, logs } of habitsWithLogs) {
      for (const log of logs) {
        if (dateMap.has(log.date)) {
          let completed = false;
          if (habit.type === 'bool') completed = log.value === 1;
          else completed = log.value >= habit.target;
          if (completed) {
            dateMap.set(log.date, dateMap.get(log.date) + 1);
          }
        }
      }
    }

    const consistencyData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date: date.slice(5), completed: count, total: habits.length }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setOverallStats({
      currentStreak: totalCurrentStreak,
      bestStreak: totalBestStreak,
      completionRate: Math.round(completionRate),
      consistencyData
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Dashboard</h3>

      {/* Current Streak */}
      <div className="mb-8 text-center">
        <div className="text-5xl font-black text-primary">{overallStats.currentStreak}</div>
        <div className="text-xs text-gray-500 mt-1">CURRENT STREAK</div>
        <div className="text-xs text-gray-400 mt-2">Your best streak is just {overallStats.bestStreak - overallStats.currentStreak} days away!</div>
      </div>

      {/* Completion Rate */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Completion Rate</span>
          <span className="font-bold">{overallStats.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${overallStats.completionRate}%` }}></div>
        </div>
      </div>

      {/* Best Streak & Final Hour */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">{overallStats.bestStreak}</div>
          <div className="text-[10px] text-gray-400">BEST STREAK</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">428</div>
          <div className="text-[10px] text-gray-400">FINAL HOUR</div>
        </div>
      </div>

      {/* Consistency Chart */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-bold text-gray-700">Consistency</h4>
          <span className="text-xs text-gray-400">October</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overallStats.consistencyData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00675c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00675c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
              <YAxis hide domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Area type="monotone" dataKey="completed" stroke="#00675c" fill="url(#colorCompleted)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Next Reward */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="text-xs font-bold text-amber-700 uppercase">Next Reward</div>
          <div className="text-sm font-semibold text-amber-800 mt-1">Unlock "2am Master" badge at 20 day streaks.</div>
        </div>
      </div>
    </div>
  );
}