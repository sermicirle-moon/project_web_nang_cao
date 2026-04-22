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
import AppLayout from './Layouts/AppLayout'; 
import PricingPage from './Pages/Pricing/Pricing';
import Checkout from './Pages/Pricing/Checkout';
import ProtectedRoute from './Components/ProtectedRoute';
import FocusStats from "./Pages/FocusStats";
import HabitsIndex from './Pages/Habits/Index';
function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          } 
        />
        
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

        <Route 
          path="/features/*" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarIndex />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/eisenhower" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Eisenhower />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/timefocus" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <TimeFocus />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/pricing'
          element={
            <ProtectedRoute>
              <MainLayout>
                <PricingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Checkout />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
        path="/focus-stats" 
        element={
        <ProtectedRoute>
          <AppLayout>
            <FocusStats />
            </AppLayout>
            </ProtectedRoute>
          } 
          />
        <Route path="/habits" element={
          <ProtectedRoute>
            <AppLayout>
              <HabitsIndex />
            </AppLayout>
          </ProtectedRoute>
          } 
          />

      </Routes>
    </Router>
    
  );
}

export default App;