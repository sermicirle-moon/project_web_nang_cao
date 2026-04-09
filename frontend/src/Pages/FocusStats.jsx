import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function FocusStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/focus/statistics?period=${period}`);
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!stats) return <div className="p-8 text-center">Không có dữ liệu</div>;

  const maxTotal = Math.max(...stats.dailyData.map(d => d.totalSeconds), 1);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thống kê tập trung</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["week", "month", "all"].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg transition ${
              period === p ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {p === "week" ? "Tuần này" : p === "month" ? "Tháng này" : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Tổng thời gian focus</p>
          <p className="text-2xl font-bold">{formatTime(stats.totalFocusSeconds)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Số phiên</p>
          <p className="text-2xl font-bold">{stats.totalSessions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Trung bình / phiên</p>
          <p className="text-2xl font-bold">{formatTime(Math.round(stats.avgFocusSecondsPerSession))}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Dài nhất</p>
          <p className="text-2xl font-bold">{formatTime(stats.longestSessionSeconds)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Chuỗi ngày hiện tại</p>
          <p className="text-2xl font-bold">{stats.currentStreakDays} ngày</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Tập trung liên tục nhất</p>
          <p className="text-2xl font-bold">{formatTime(stats.longestContinuousFocusSeconds)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4">Thời gian focus theo ngày</h3>
        <div className="space-y-3">
          {stats.dailyData.map((day) => (
            <div key={day.date} className="flex items-center gap-2">
              <div className="w-24 text-sm font-medium text-gray-600">{day.date}</div>
              <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(day.totalSeconds / maxTotal) * 100}%` }}
                ></div>
              </div>
              <div className="w-20 text-right text-sm text-gray-700">{formatTime(day.totalSeconds)}</div>
            </div>
          ))}
          {stats.dailyData.length === 0 && <p className="text-center text-gray-400">Không có dữ liệu</p>}
        </div>
      </div>
    </div>
  );
}