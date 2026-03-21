import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import LandingPage from './Pages/LandingPage/LandingPage';
import Login from './Pages/Login';
import Register from './Pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang Landing Page: Được bọc trong MainLayout để có Navbar/Footer */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          } 
        />

        {/* Trang Login & Register: Thường không cần Navbar của Landing Page 
            nên chúng ta để riêng biệt hoặc bọc trong một AuthLayout khác */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Bạn có thể thêm trang 404 hoặc Redirect nếu cần */}
      </Routes>
    </Router>
  );
}

export default App;