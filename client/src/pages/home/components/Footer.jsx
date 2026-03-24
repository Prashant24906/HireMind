import React from 'react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 max-w-7xl mx-auto text-textSoft text-sm flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-8 font-medium">
         <span className="text-white text-lg tracking-tight">HireMind</span>
         <a href="#product" className="hover:text-white transition-colors">Product</a>
         <a href="#journal" className="hover:text-white transition-colors">Journal</a>
         <a href="#about" className="hover:text-white transition-colors">About</a>
         <a href="#careers" className="hover:text-white transition-colors">Careers</a>
      </div>
      
      <div>
         &copy; 2025 &middot; All rights reserved
      </div>
    </footer>
  );
}
