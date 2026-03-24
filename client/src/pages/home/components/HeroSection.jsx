import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

export default function HeroSection() {
  const { user } = useAuthStore();
  const dashboardLink = user?.role === 'interviewer' ? '/interviewer/dashboard' : '/dashboard';

  return (
    <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />

      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight text-white max-w-4xl animate-fade-in-up">
        Hiring insights, <br className="hidden md:block" />
        <span className="text-textSoft">built for business</span>
      </h1>
      
      <p className="mt-6 text-lg md:text-xl text-textSoft max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        Track candidates, reduce bias, and accelerate hiring—with clarity and confidence.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {user ? (
          <Link to={dashboardLink} className="w-full sm:w-auto px-8 py-3.5 bg-brand text-darker font-medium rounded-full hover:brightness-110 shadow-[0_0_20px_rgba(198,244,50,0.3)] transition-all">
            Go to your Dashboard
          </Link>
        ) : (
          <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-brand text-darker font-medium rounded-full hover:brightness-110 shadow-[0_0_20px_rgba(198,244,50,0.2)] transition-all">
            Request a demo
          </Link>
        )}
        <a href="#product" className="w-full sm:w-auto px-8 py-3.5 bg-surface text-white border border-white/10 font-medium rounded-full hover:bg-surfaceHover transition-all">
          Explore the platform
        </a>
      </div>
    </section>
  );
}
