import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function TimeFocus() {
  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("focus"); // focus, shortBreak, longBreak
  const intervalRef = useRef(null);

  // Cấu hình thời gian cho từng loại session
  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          // Tự động chuyển sang focus sau khi kết thúc break
          if (sessionType !== "focus") {
            setSessionType("focus");
            setTimeLeft(durations.focus);
            startTimer();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setSessionType("focus");
    setTimeLeft(durations.focus);
  };

  const changeSession = (type) => {
    if (type === sessionType) return;
    pauseTimer();
    setSessionType(type);
    setTimeLeft(durations[type]);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Dữ liệu tĩnh cho các panel (có thể thay bằng API sau) ---
  const stats = {
    goalProgress: 75,
    deadlineProgress: 60,
    tasksFocused: 4.5,
    hoursRemaining: "25:00",
  };

  const strategy = {
    title: "Q4 Market Expansion Strategy",
    description: "Decide what market expansion strategy will help you achieve your goals.",
    keyPoints: [
      "Expand into new markets",
      "Increase market share",
      "Improve customer satisfaction",
      "Increase revenue",
    ],
    steps: [
      "Define your target audience",
      "Identify key metrics",
      "Develop a plan",
      "Execute",
    ],
  };

  const workload = {
    new: 3,
    active: 5,
    tasks: 12,
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Time Focus</h1>

        {/* Tabs chính */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {["focus", "shortBreak", "longBreak"].map((type) => (
            <button
              key={type}
              onClick={() => changeSession(type)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                sessionType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "focus"
                ? "Deep Work"
                : type === "shortBreak"
                ? "Short Break"
                : "Long Break"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========== CỘT TRÁI ========== */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timer Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <h3 className="font-semibold text-lg text-gray-700 mb-2">
                {sessionType === "focus"
                  ? "Deep Work"
                  : sessionType === "shortBreak"
                  ? "Short Break"
                  : "Long Break"}
              </h3>
              <div className="text-6xl font-mono font-bold my-4">{formatTime(timeLeft)}</div>
              <div className="flex justify-center gap-3">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
                  >
                    START
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 transition"
                  >
                    PAUSE
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition"
                >
                  RESET
                </button>
              </div>
              <p className="mt-4 text-gray-500 text-sm italic">
                "Demonstrate at your fingertips your own time and focus. The sun is now in the sky and it's going to be a great day."
              </p>
            </div>

            {/* Daily Progress */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">Daily Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tasks focused</span>
                    <span>{stats.tasksFocused} / 8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.tasksFocused / 8) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Hours remaining</span>
                    <span>{stats.hoursRemaining}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/tasks/new"
                className="mt-6 block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                New Task
              </Link>
            </div>
          </div>

          {/* ========== CỘT GIỮA ========== */}
          <div className="lg:col-span-1 space-y-6">
            {/* Self-Picked Stats */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">SELFPICKED</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>OF GOAL</span>
                    <span>{stats.goalProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.goalProgress}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>DEADLINE</span>
                    <span>{stats.deadlineProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats.deadlineProgress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-800">BEFORE TAKING</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Find out if activities are relevant to you. Reduce those that are not important.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-800">Blog: system Documentation</h4>
                <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
              </div>
            </div>

            {/* Quick Actions (Footer) */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition">
                  Generate Sub-tasks
                </button>
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition">
                  Bulk Reschedule
                </button>
              </div>
            </div>
          </div>

          {/* ========== CỘT PHẢI ========== */}
          <div className="lg:col-span-1 space-y-6">
            {/* Strategy Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800">{strategy.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Key Points:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-600">
                  {strategy.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Steps:</h4>
                <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-600">
                  {strategy.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Workload Intensity */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">Workload Intensity</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{workload.new}</div>
                  <div className="text-xs text-gray-500">New Task</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{workload.active}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{workload.tasks}</div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}