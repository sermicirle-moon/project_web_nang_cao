import Button from "./UI/button";
import { Link, useLocation,useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useAuth } from '../context/AuthContext'; // thêm


export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // thêm
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  }
  
  const navLinkClass = (path) => 
    `font-headline font-bold text-sm transition-colors ${
      location.pathname === path 
        ? 'text-primary border-b-2 border-primary/50 pb-1' 
        : 'text-on-surface-variant hover:text-primary'
    }`;

  return (
    // Đã đổi 'fixed' thành 'sticky'
    <nav className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,53,52,0.08)]">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <Link to="/features" className="text-2xl font-black text-primary tracking-tighter font-headline"> 
          OrganizeMe
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="font-headline font-bold text-sm text-primary border-b-2 border-primary/50 pb-1">Features</Link>
          <Link to="/pricing" className="font-headline font-bold text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</Link>
          <Link to="/about" className="font-headline font-bold text-sm text-on-surface-variant hover:text-primary transition-colors">About</Link>
        </div>

        {/* Nút hành động */}
        {!isAuthPage && (
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-surface-container-lowest rounded-full pl-2 pr-3 py-1 shadow-sm hover:shadow transition-all"
                >
                  {/* Hiển thị avatar nếu có, nếu không thì hiển thị chữ cái đầu */}
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-on-surface text-sm">{user.fullName}</span>
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="font-headline font-bold text-sm text-on-surface-variant hover:text-primary">Login</Link>
                <Link to="/register">
                  <Button className="px-6 py-2.5 text-sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}