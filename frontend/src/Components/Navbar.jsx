import Button from "./UI/button";
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,53,52,0.08)]">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        {/* Logo với font Headline đen đặc */}
        <Link to="/" className="text-2xl font-black text-primary tracking-tighter font-headline"> 
          OrganizeMe
        </Link>

        {/* Menu giữa - Ẩn trên mobile */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="font-headline font-bold text-sm text-primary border-b-2 border-primary/50 pb-1">Features</a>
          <a href="#" className="font-headline font-bold text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
          <a href="#" className="font-headline font-bold text-sm text-on-surface-variant hover:text-primary transition-colors">About</a>
        </div>

        {/* Nút hành động */}
        {!isAuthPage && (
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-headline font-bold text-sm text-on-surface-variant hover:text-primary">Login</Link>
          <Link to="/register">
            <Button className="px-6 py-2.5 text-sm">Sign Up</Button>
          </Link>
        </div>
      )}
      </div>
    </nav>
  );
}