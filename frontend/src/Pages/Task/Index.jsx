import Navbar from "../../Components/Navbar"; 
import Sidebar from "../../Layouts/sidebar";
import ListManager from "../../Layouts/TaskManagement/ListManager"; 
import Body from "./Body"; 
import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // Thêm thư viện Router

export default function Index() {
  // Lấy đường dẫn hiện tại (Ví dụ: /features/today -> lấy ra chữ 'today')
  const location = useLocation();
  const currentListId = location.pathname.split('/').pop();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800">
      
      {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
      <div className="shrink-0 z-30 relative border-b border-gray-100">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-white">
        
        {/* 2. THANH MENU NGOÀI CÙNG BÊN TRÁI */}
        <Sidebar />

        {/* 3. QUẢN LÝ DANH SÁCH (CỘT 2) */}
        {/* Truyền ID lấy từ URL vào để ListManager biết mục nào đang được chọn và tô màu */}
        <ListManager 
           activeListId={currentListId} 
        />

        {/* 4. KHU VỰC NỘI DUNG ĐỘNG (CỘT 3 & 4) */}
        <div className="flex-1 overflow-y-auto bg-white relative z-0">
          <Routes>
            {/* Nếu người dùng chỉ gõ /features, tự động chuyển hướng sang /features/today */}
            <Route path="/" element={<Navigate to="today" replace />} />
            
            {/* Nếu người dùng gõ /features/inbox, /features/today, hoặc /features/5... */}
            {/* Component Body sẽ tự bắt lấy các ID này qua hàm useParams() */}
            <Route path=":listId" element={<Body />} />
          </Routes>
        </div>
        
      </div>
    </div>
  );
}