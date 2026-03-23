import Navbar from "../../Components/Navbar"; 
import Sidebar from "../../Layouts/sidebar";
import ListManager from "../../Layouts/TaskManagement/ListManager"; 
import Body from "./Body"; 

export default function Index() {
  return (
    // Đảm bảo nền ngoài cùng là bg-white thay vì bg-surface
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800">
      
      {/* 1. Navbar trên cùng */}
      <div className="shrink-0 z-30 relative border-b border-gray-100">
        <Navbar />
      </div>

      {/* Phần thân dưới: Chứa 3 cột */}
      <div className="flex flex-1 overflow-hidden relative bg-white">
        
        {/* 2. Cột 1: Sidebar siêu mỏng */}
        <Sidebar />

        {/* 3. Cột 2: Menu quản lý List */}
        <ListManager />

        {/* 4. CỘT 3: NỘI DUNG CHÍNH (THỦ PHẠM NẰM Ở ĐÂY) */}
        {/* TÔI ĐÃ XÓA SẠCH px, py VÀ ĐẢM BẢO NÓ LÀ bg-white */}
        <div className="flex-1 overflow-y-auto bg-white relative z-0">
          <Body />
        </div>
        
      </div>
    </div>
  );
}