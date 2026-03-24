import React from 'react';

const features = [
  {
    num: '001',
    title: 'Source',
    desc: 'Talent pools, parsing, and pipeline across your whole organization.'
  },
  {
    num: '002',
    title: 'Assess',
    desc: 'Forecast candidate performance and cultural goal alignment.'
  },
  {
    num: '003',
    title: 'Report',
    desc: 'Generate DEI disclosures, automate feedback frameworks.'
  },
  {
    num: '004',
    title: 'Hire',
    desc: 'Surface interview insights and operational next steps.'
  }
];

export default function FeatureSection() {
  return (
    <section id="product" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
           <h2 className="text-3xl md:text-5xl font-medium text-white leading-tight sticky top-32">
             Everything you need to source, assess, and hire top talent.
           </h2>
        </div>
        
        <div className="flex flex-col gap-12">
          {features.map((feat) => (
            <div key={feat.num} className="group border-b border-white/10 pb-12 hover:border-brand/50 transition-colors">
              <span className="text-textSoft text-sm font-mono">{feat.num}</span>
              <h3 className="text-3xl font-medium text-white mt-4">{feat.title}</h3>
              <p className="text-lg text-textSoft mt-3 max-w-sm">{feat.desc}</p>
            </div>
          ))}
          <a href="#explore" className="text-brand font-medium hover:underline inline-flex items-center gap-2 mt-4">
            Explore features &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
