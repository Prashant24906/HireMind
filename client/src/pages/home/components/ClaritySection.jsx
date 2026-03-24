import React from 'react';

export default function ClaritySection() {
  return (
    <section className="py-24 bg-surface px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
         <div>
            <h3 className="text-xl font-medium text-white mb-4">Clarity drives action</h3>
            <p className="text-textSoft leading-relaxed">
              We believe better hiring decisions start with better data—measured, visible, and trusted.
            </p>
         </div>
         <div>
            <h3 className="text-xl font-medium text-white mb-4">Hiring is a systems problem</h3>
            <p className="text-textSoft leading-relaxed">
              We build tools that help teams connect the dots between sourcing, interviewing, and accountability.
            </p>
         </div>
         <div>
            <h3 className="text-xl font-medium text-brand mb-4">Progress over perfection</h3>
            <p className="text-textSoft leading-relaxed text-white/90">
              We support real-world momentum—helping organizations move from ambition to measurable recruiting success.
            </p>
         </div>
      </div>
    </section>
  );
}
