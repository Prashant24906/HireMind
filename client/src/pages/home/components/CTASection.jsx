import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

export default function CTASection() {
  const { user } = useAuthStore();
  const dashboardLink = user?.role === 'interviewer' ? '/interviewer/dashboard' : '/dashboard';

  return (
    <section id='about' className="py-32 px-6 bg-surface/50 border-t border-b border-white/5 mt-12 text-center text-white relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
      <h2 className="text-3xl md:text-5xl font-medium mb-8 relative z-10">
        Ready to operationalize your hiring goals?
      </h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
        {user ? (
          <Link to={dashboardLink} className="w-full sm:w-auto px-10 py-4 bg-brand text-darker font-medium rounded-full hover:brightness-110 shadow-[0_0_20px_rgba(198,244,50,0.3)] transition-all">
            Go to Dashboard &rarr;
          </Link>
        ) : (
          <>
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-brand text-darker font-medium rounded-full hover:brightness-110 transition-all">
              Request a demo
            </Link>
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-white text-darker font-medium rounded-full hover:bg-gray-100 transition-all">
              Get started
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
