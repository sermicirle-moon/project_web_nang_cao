// File: src/Pages/Calendar/MainCalendar.jsx
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // PLUGIN THÁNG (Mới)
import timeGridPlugin from "@fullcalendar/timegrid"; // PLUGIN TUẦN/NGÀY
import interactionPlugin from "@fullcalendar/interaction";

export default function MainCalendar() {
  const [events, setEvents] = useState([
    { 
      id: "1", 
      title: "Họp team Zentask", 
      start: "2026-03-24T09:00:00", 
      end: "2026-03-24T10:30:00", 
      backgroundColor: "#3b82f6", borderColor: "#3b82f6"
    },
    { 
      id: "2", 
      title: "Deadline UI/UX", 
      start: "2026-03-25", // Chỉ ghi ngày -> Sự kiện kéo dài cả ngày
      backgroundColor: "#ef4444", borderColor: "#ef4444"
    }
  ]);

  // Hàm: Quét chuột để tạo mới
  const handleDateSelect = (selectInfo) => {
    let title = prompt("Nhập tên sự kiện mới:");
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); 

    if (title) {
      setEvents([
        ...events, 
        {
          id: String(Date.now()),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay, // Xác định xem là sự kiện có giờ hay cả ngày
          backgroundColor: "#10b981", borderColor: "#10b981"
        }
      ]);
    }
  };

  // Hàm: Bấm vào sự kiện để xóa
  const handleEventClick = (clickInfo) => {
    if (window.confirm(`Xóa tác vụ '${clickInfo.event.title}'?`)) {
      setEvents(events.filter(event => event.id !== clickInfo.event.id));
    }
  };

  // Hàm: Cập nhật giờ sau khi Kéo thả/Kéo giãn
  const handleEventChange = (changeInfo) => {
    setEvents(events.map(event => 
      event.id === changeInfo.event.id 
        ? { ...event, start: changeInfo.event.startStr, end: changeInfo.event.endStr } 
        : event
    ));
  };

  return (
    <div className="h-full w-full bg-white p-6">
      
      {/* Tiêu đề trang (Tùy chọn) */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Lịch trình</h1>
      </div>

      <div className="h-[calc(100vh-140px)] w-full">
        <FullCalendar
          // NẠP 3 PLUGIN CÙNG LÚC
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          
          initialView="dayGridMonth" // Mặc định vào sẽ hiện Lưới Tháng
          
          // THANH CÔNG CỤ THẦN THÁNH
          headerToolbar={{
            left: 'prev,next today', // Nút lùi, tiến, và nút "Hôm nay"
            center: 'title', // Chữ "Tháng 3 2026"
            right: 'dayGridMonth,timeGridWeek,timeGridDay' // 3 NÚT: THÁNG - TUẦN - NGÀY
          }}
          
          // Tùy chỉnh tên các nút cho ra tiếng Việt
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày'
          }}
          
          events={events}
          editable={true} 
          selectable={true} 
          selectMirror={true} 
          dayMaxEvents={true} // Tháng có quá nhiều sự kiện sẽ hiện nút "+ Xem thêm"
          
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange} 
          
          locale="vi"
          slotLabelFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
          height="100%"
        />
      </div>
    </div>
  );
}