import { useState } from "react"; // THÊM DÒNG NÀY
import Navbar from "../../Components/Navbar"; 
import Sidebar from "../../Layouts/sidebar";
import ListManager from "../../Layouts/TaskManagement/ListManager"; 
import Body from "./Body"; 

export default function Index() {
  // --- STATE CẦU NỐI ---
  // Mặc định khi mới vào web sẽ chọn mục "Hôm nay"
  const [activeList, setActiveList] = useState({ id: 'today', name: 'Hôm nay' });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800">
      <div className="shrink-0 z-30 relative border-b border-gray-100">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-white">
        <Sidebar />

        {/* TRUYỀN HÀM CHỌN LIST CHO CỘT BÊN TRÁI */}
        <ListManager 
           activeListId={activeList.id} 
           onSelectList={setActiveList} 
        />

        {/* TRUYỀN DỮ LIỆU LIST CHO CỘT BÊN PHẢI */}
        <div className="flex-1 overflow-y-auto bg-white relative z-0">
          <Body activeList={activeList} />
        </div>
        
      </div>
    </div>
  );
}