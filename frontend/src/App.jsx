import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import LandingPage from './Pages/LandingPage/LandingPage';
import Login from './Pages/Login';
import Register from './Pages/Register';
import AuthLayout from './Layouts/AuthLayout';
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
      </Routes>
    </Router>
  );
}

export default App;