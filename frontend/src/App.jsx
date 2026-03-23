import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage/LandingPage';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Index from './Pages/Task/Index';
import MainLayout from './Layouts/MainLayout';

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

        {/* 2. Các trang Xác thực (Không có Navbar của Landing Page) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 3. Trang Quản lý công việc (Khi ấn vào chữ Features) */}
        {/* URL là /features, toàn bộ giao diện nằm gọn trong Index */}
        <Route path="/features" element={<Index />} />
        
      </Routes>
    </Router>
  );
}

export default App;