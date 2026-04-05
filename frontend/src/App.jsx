import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage/LandingPage';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Index from './Pages/Task/Index';
import MainLayout from './Layouts/MainLayout';
import AuthLayout from './Layouts/AuthLayout';
import CalendarIndex from './Pages/Calendar/Index';
import Settings from './Pages/UserSetting/UserSetting';
import Eisenhower from './Pages/Eisenhower/Eisenhower';
import TimeFocus from './Pages/TimeFocus/TimeFocus';
import AppLayout from './Layouts/AppLayout';  // THÊM DÒNG NÀY


function App() {
  return (
    <Router>
      <Routes>
        
        {/* 1. Trang chủ (Landing Page) */}
        {/* Đã bỏ thẻ <> </> thừa. Element nhận trực tiếp MainLayout */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          } 
        />
        {/* 3. Trang Quản lý công việc (Khi ấn vào chữ Features) */}
        {/* URL là /features, toàn bộ giao diện nằm gọn trong Index */}
        <Route path="/features" element={<Index />} />
        
        {/* Trang Login & Register: Thường không cần Navbar của Landing Page 
            nên chúng ta để riêng biệt hoặc bọc trong một AuthLayout khác */}
        <Route 
          path="/login" 
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } 
        />
        <Route 
          path="/register" 
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          } 
        />

        <Route path="/calendar" element={<CalendarIndex />} />
        <Route path="/eisenhower" element={<AppLayout><Eisenhower /></AppLayout>} />
        <Route path="/timefocus" element={<AppLayout><TimeFocus /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

      </Routes>
    </Router>
  );
}

export default App;