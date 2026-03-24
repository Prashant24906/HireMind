import React from 'react';

const articles = [
  { title: 'How to Build an AI-Ready Interview Stack', category: 'Insights', readTime: '4 min' },
  { title: 'Hiring Isn’t a Side Project: Making Talent AI Operational', category: 'Strategy', readTime: '7 min' },
  { title: 'Inside the HireMind Model: How We Turn Data Into Offers', category: 'Insights', readTime: '5 min' }
];

export default function JournalSection() {
  return (
    <section id="journal" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-baseline mb-12">
        <h2 className="text-sm font-mono text-textSoft uppercase tracking-widest">From the journal</h2>
        <a href="#all-articles" className="text-brand font-medium hover:underline text-sm">View all articles</a>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
         {articles.map((article, idx) => (
           <a key={idx} href={`#article-${idx}`} className="group block">
             <div className="aspect-[4/3] bg-surface rounded-xl border border-white/5 mb-6 group-hover:border-brand/40 transition-colors"></div>
             <h3 className="text-xl font-medium text-white group-hover:text-brand transition-colors">
               {article.title}
             </h3>
             <div className="mt-4 flex items-center gap-3 text-sm text-textSoft">
               <span>{article.category}</span>
               <span className="w-1 h-1 rounded-full bg-white/20"></span>
               <span>{article.readTime}</span>
             </div>
           </a>
         ))}
      </div>
    </section>
  );
}
