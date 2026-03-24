import Navbar from "../../Components/Navbar"; 
import Sidebar from "../../Layouts/sidebar";
import CalendarBoard from "./CalendarBoard"; 

export default function CalendarIndex() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800">
      
      {/* Navbar trên cùng */}
      <div className="shrink-0 z-30 relative border-b border-gray-100">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-white">
        
        {/* Sidebar siêu mỏng */}
        <Sidebar />

        {/* CỘT CHÍNH: Bảng lịch bung full màn hình */}
        <div className="flex-1 overflow-y-auto bg-white relative z-0">
          <CalendarBoard />
        </div>
        
      </div>
    </div>
  );
}