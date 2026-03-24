// File: src/Components/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { path: "/features", icon: "task_alt", label: "Công việc" },
    { path: "/calendar", icon: "calendar_month", label: "Lịch" },
    { path: "/eisenhower", icon: "grid_view", label: "Ma trận" },       // thay đổi icon nếu muốn
    { path: "/timefocus", icon: "timer", label: "Time Focus" },
    { path: "/habits", icon: "vital_signs", label: "Thói quen" },
  ];

  return (
    // w-16 tương đương 64px - Cực kỳ nhỏ gọn
    <aside className="w-16 bg-[#fbfbfb] border-r border-gray-200 h-full flex flex-col items-center py-4 shrink-0 z-20">

      {/* Các công cụ chính (Chỉ dùng Icon) */}
      <nav className="flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label} // Hiển thị chữ khi di chuột vào (Tooltip cơ bản)
            className={({ isActive }) =>
              `w-full aspect-square flex items-center justify-center rounded-xl transition-colors ${
                isActive ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {item.icon}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Cài đặt ở dưới đáy */}
      <button className="mt-auto w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
        <span className="material-symbols-outlined text-[24px]">settings</span>
      </button>
      
    </aside>
  );
}