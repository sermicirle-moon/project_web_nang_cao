import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function TimeFocus() {
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("focus");
  const [activeSessionId, setActiveSessionId] = useState(null);

  // --- REFS ĐỂ TRÁNH STALE CLOSURE & TRACKING ---
  const intervalRef = useRef(null);
  const sessionTypeRef = useRef(sessionType);
  const activeSessionIdRef = useRef(null); // Ref để dùng trong Cleanup (fix lỗi state bị cũ)
  const remainingOnPauseRef = useRef(0);
  
  // Tracking Focus Time
  const sessionStartTimeRef = useRef(null); // Mốc bắt đầu của TỪNG ĐOẠN chạy
  const accumulatedFocusTimeRef = useRef(0); // Tổng thời gian focus đã cộng dồn qua các lần pause

  // Tracking Pause Time (Bổ sung cho API giống TickTick)
  const pauseStartTimeRef = useRef(null);
  const accumulatedPauseTimeRef = useRef(0);
  const pauseCountRef = useRef(0);

  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    sessionTypeRef.current = sessionType;
  }, [sessionType]);

  // Hàm Helper để cập nhật cả State và Ref cho Session ID
  const updateSessionId = (id) => {
    setActiveSessionId(id);
    activeSessionIdRef.current = id;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper tính TỔNG thời gian focus thực tế (Bao gồm cả cộng dồn + đoạn đang chạy)
  const getTotalFocusDuration = () => {
    let total = accumulatedFocusTimeRef.current;
    if (sessionStartTimeRef.current) {
      total += Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
    }
    return total;
  };

  // ==================== API CALLS ====================
  const startSessionOnServer = async (type) => {
    try {
      const res = await api.post("/focus/start", {
        taskId: null,
        sessionType: type,
      });
      updateSessionId(res.data.sessionId);
      return res.data.sessionId;
    } catch (err) {
      console.error("Lỗi start session:", err);
      return null;
    }
  };

  const endSessionOnServer = async (sessionId, finalDurationSeconds, isCompleted = true) => {
    if (!sessionId) return;
    try {
      await api.put("/focus/end", {
        sessionId: sessionId,
        finalDurationSeconds: finalDurationSeconds,
        totalPauseSeconds: accumulatedPauseTimeRef.current, // Gửi lên số liệu Pause thật
        pauseCount: pauseCountRef.current,                  // Gửi lên số lần Pause
        isCompleted: isCompleted,
      });
      console.log(`✅ Session ${sessionId} (${sessionTypeRef.current}) ended: ${finalDurationSeconds}s, Pauses: ${pauseCountRef.current}, completed=${isCompleted}`);
    } catch (err) {
      console.error("Lỗi end session:", err);
    }
  };

  // ==================== TIMER LOGIC ====================
  const startTimer = async () => {
    if (intervalRef.current) return;

    // 1. Tạo session mới nếu chưa có
    if (!activeSessionIdRef.current) {
      const sessionId = await startSessionOnServer(sessionTypeRef.current);
      if (!sessionId) return;
      
      // Reset toàn bộ bộ đếm cho Session mới
      accumulatedFocusTimeRef.current = 0;
      accumulatedPauseTimeRef.current = 0;
      pauseCountRef.current = 0;
    } 

    // 2. Xử lý logic nếu vừa Resume từ Pause
    if (pauseStartTimeRef.current) {
      const pauseDuration = Math.floor((Date.now() - pauseStartTimeRef.current) / 1000);
      accumulatedPauseTimeRef.current += pauseDuration;
      pauseStartTimeRef.current = null;
    }

    // 3. Bắt đầu đếm (Bất kể là Start mới hay Resume)
    setIsRunning(true);
    sessionStartTimeRef.current = Date.now(); // Chốt mốc bắt đầu của đoạn chạy này
    const startTime = Date.now();
    let remaining = timeLeft;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newRemaining = Math.max(0, remaining - elapsed);
      setTimeLeft(newRemaining);

      // Khi Timer chạy hết (Hoàn thành)
      if (newRemaining === 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);

        if (activeSessionIdRef.current) {
          const finalDuration = getTotalFocusDuration();
          endSessionOnServer(activeSessionIdRef.current, finalDuration, true);
          
          // Dọn dẹp
          updateSessionId(null);
          sessionStartTimeRef.current = null;
        }
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    
    // Dừng đếm ngược
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    remainingOnPauseRef.current = timeLeft;

    // 1. Chốt thời gian Focus của đoạn vừa chạy và cộng dồn lại
    if (sessionStartTimeRef.current) {
      const elapsedThisSegment = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      accumulatedFocusTimeRef.current += elapsedThisSegment;
      sessionStartTimeRef.current = null; // Đánh dấu là không còn đoạn nào đang chạy
    }

    // 2. Bắt đầu đếm thời gian Pause
    pauseCountRef.current += 1;
    pauseStartTimeRef.current = Date.now();
  };

  const resumeTimer = async () => {
    if (isRunning) return;
    setTimeLeft(remainingOnPauseRef.current);
    remainingOnPauseRef.current = 0;
    
    // startTimer đã bao gồm logic cập nhật lại mốc sessionStartTimeRef mới
    startTimer();
  };

  const resetTimer = async () => {
    if (activeSessionIdRef.current) {
      // Lấy toàn bộ tổng thời gian thực tế đã chạy
      const finalDuration = getTotalFocusDuration();
      await endSessionOnServer(activeSessionIdRef.current, finalDuration, false);
      
      updateSessionId(null);
      sessionStartTimeRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRunning(false);
    setSessionType("focus");
    setTimeLeft(durations.focus);
    remainingOnPauseRef.current = 0;
    pauseStartTimeRef.current = null;
  };

  const changeSession = async (type) => {
    if (type === sessionType) return;
    
    if (activeSessionIdRef.current) {
      const finalDuration = getTotalFocusDuration();
      await endSessionOnServer(activeSessionIdRef.current, finalDuration, false);
      updateSessionId(null);
      sessionStartTimeRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(durations[type]);
    remainingOnPauseRef.current = 0;
    pauseStartTimeRef.current = null;
  };

  // Cleanup khi user chuyển trang đột ngột
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Sử dụng activeSessionIdRef.current thay vì activeSessionId để tránh lỗi state cũ
      if (activeSessionIdRef.current) {
        const finalDuration = getTotalFocusDuration();
        endSessionOnServer(activeSessionIdRef.current, finalDuration, false);
      }
    };
  }, []);
  // UI giữ nguyên (không thay đổi)
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Time Focus</h1>
          <button
            onClick={() => navigate("/focus-stats")}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            Thống kê
          </button>
        </div>

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
          {/* Cột trái - Timer */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <h3 className="font-semibold text-lg text-gray-700 mb-2">
                {sessionType === "focus"
                  ? "Focus Timer"
                  : sessionType === "shortBreak"
                  ? "Short Break Timer"
                  : "Long Break Timer"}
              </h3>
              <div className="text-6xl font-mono font-bold my-4">{formatTime(timeLeft)}</div>
              <div className="flex justify-center gap-3">
                {!isRunning ? (
                  <button
                    onClick={resumeTimer}
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
                "Demonstrate at your fingertips your own time and focus..."
              </p>
            </div>

            {/* Phần còn lại giữ nguyên UI tĩnh */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">Daily Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tasks focused</span>
                    <span>4.5 / 8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "56%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Hours remaining</span>
                    <span>25:00</span>
                  </div>
                </div>
              </div>
              <button className="mt-6 block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                New Task
              </button>
            </div>
          </div>

          {/* Cột giữa và phải giữ nguyên (bỏ qua để ngắn gọn, bạn giữ nguyên từ file cũ) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">SELFPICKED</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>OF GOAL</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>DEADLINE</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "60%" }}></div>
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

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800">Q4 Market Expansion Strategy</h3>
              <p className="text-sm text-gray-600 mt-1">
                Decide what market expansion strategy will help you achieve your goals.
              </p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Key Points:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-600">
                  <li>Expand into new markets</li>
                  <li>Increase market share</li>
                  <li>Improve customer satisfaction</li>
                  <li>Increase revenue</li>
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Steps:</h4>
                <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-600">
                  <li>Define your target audience</li>
                  <li>Identify key metrics</li>
                  <li>Develop a plan</li>
                  <li>Execute</li>
                </ol>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">Workload Intensity</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <div className="text-xs text-gray-500">New Task</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">12</div>
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