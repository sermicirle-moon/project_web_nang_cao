import { useState } from "react";
// Import các "viên gạch" vào đây
import Sidebar from "./UserSidebar";
import Profile from "./Profile";
import ChangePass from "./ChangePass";

export default function Settings() {
  // BỘ NHỚ CỦA TIVI: Nhớ xem người dùng đang ở tab nào
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex h-screen w-full bg-[#e3fbfa]">
      
      {/* 1. Gắn Sidebar vào. Truyền biến nhớ và hàm thay đổi xuống cho nó */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Vùng màn hình chính */}
      <main className="flex-1 p-10">
        
        {/* Lệnh rẽ nhánh (Conditional Rendering): 
            Nếu activeTab là 'profile' thì render thẻ <Profile />, v.v... */}
        {activeTab === 'profile' && <Profile />}
        
        {activeTab === 'password' && <ChangePass />}

      </main>

    </div>
  );
}