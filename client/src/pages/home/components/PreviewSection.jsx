import React from 'react';

export default function PreviewSection() {
  return (
    <section className="px-6 pb-32 max-w-6xl mx-auto -mt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="w-full rounded-2xl bg-surface border border-white/10 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
        {/* Mockup Top Bar */}
        <div className="absolute top-0 left-0 w-full h-12 bg-dark border-b border-white/10 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
        </div>
        
        {/* Mockup content */}
        <div className="w-full h-full pt-12 p-8 flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-6">
               <div className="p-6 rounded-xl bg-dark border border-white/5">
                 <p className="text-textSoft text-sm">Total Candidates processed</p>
                 <h3 className="text-3xl font-medium text-white mt-2">1,920</h3>
               </div>
               <div className="p-6 rounded-xl bg-dark border border-white/5 relative overflow-hidden">
                 <p className="text-textSoft text-sm whitespace-nowrap">Screening Progress</p>
                 <h3 className="text-3xl font-medium text-brand mt-2">84%</h3>
                 {/* Decorative Graph */}
                 <div className="absolute bottom-0 right-0 w-32 h-20 bg-brand/20 blur-2xl"></div>
               </div>
               <div className="p-6 rounded-xl bg-dark border border-white/5">
                 <p className="text-textSoft text-sm whitespace-nowrap">Avg. Time to Hire</p>
                 <h3 className="text-3xl font-medium text-white mt-2">14 Days</h3>
               </div>
            </div>
            {/* Chart Area Mockup */}
            <div className="mt-6 flex-1 w-full rounded-xl border border-white/5 bg-gradient-to-t from-brand/5 to-transparent relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full h-px bg-brand/30"></div>
               {/* Line chart mock using SVG */}
               <svg className="absolute w-full h-full text-brand" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0 100 Q 20 80, 40 60 T 100 20 L 100 100 Z" fill="currentColor" fillOpacity="0.1" />
                  <path d="M0 100 Q 20 80, 40 60 T 100 20" stroke="currentColor" strokeWidth="2" fill="none" />
               </svg>
            </div>
        </div>
      </div>
    </section>
  );
}
