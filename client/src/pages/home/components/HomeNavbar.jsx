import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

export default function HomeNavbar() {
  const { user } = useAuthStore();
  const dashboardLink = user?.role === 'interviewer' ? '/interviewer/dashboard' : '/dashboard';

  return (
    <nav className="fixed top-0 w-full z-50 bg-darker/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link to="/" className="text-xl font-medium tracking-tight text-white hover:text-brand transition-colors">
            HireMind
          </Link>
          
          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-textSoft font-medium">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#journal" className="hover:text-white transition-colors">Journal</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#careers" className="hover:text-white transition-colors">Careers</a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <Link to={dashboardLink} className="text-sm font-medium bg-brand text-darker px-6 py-2.5 rounded-full hover:brightness-110 shadow-[0_0_15px_rgba(198,244,50,0.3)] transition-all">
              Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white hover:text-brand transition-colors">
                Log in
              </Link>
              <Link to="/register" className="text-sm font-medium bg-white text-darker px-5 py-2.5 rounded-full hover:bg-brand transition-colors">
                Get started &rarr;
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
