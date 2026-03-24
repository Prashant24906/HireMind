import React from 'react';

export default function TestimonialSection() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 mt-12">
      <div className="flex flex-col md:flex-row gap-16 justify-between items-start">
        <h2 className="text-3xl md:text-5xl font-medium text-white max-w-lg leading-tight">
          Why TechCorp chose HireMind
        </h2>
        <div className="max-w-md">
          <p className="text-lg text-textSoft leading-relaxed">
            "With fragmented data and growing hiring pressure, TechCorp turned to HireMind to streamline their interview workflows. The result? Faster decisions, fewer spreadsheets, and 34% faster time-to-hire."
          </p>
          <a href="#case-study" className="text-brand font-medium hover:underline inline-block mt-6">
            Read case study &rarr;
          </a>
        </div>
      </div>
      
      <div className="mt-32 pt-24 border-t border-white/5 md:flex hidden justify-between">
         <h2 className="text-4xl lg:text-5xl font-medium text-white max-w-3xl leading-tight">
            We finally moved past spreadsheets and guesswork. Now we have real data to guide real decisions.
         </h2>
         <div className="text-right flex-shrink-0 mt-8 md:mt-0">
            <p className="text-white font-medium">Elliot Williams</p>
            <p className="text-textSoft text-sm">Head of Talent, Flux Materials</p>
         </div>
      </div>
    </section>
  );
}
