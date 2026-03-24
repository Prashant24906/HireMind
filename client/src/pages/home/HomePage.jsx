import React from 'react';
import HomeNavbar from './components/HomeNavbar';
import HeroSection from './components/HeroSection';
import PreviewSection from './components/PreviewSection';
import FeatureSection from './components/FeatureSection';
import ClaritySection from './components/ClaritySection';
import TestimonialSection from './components/TestimonialSection';
import JournalSection from './components/JournalSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-darker text-white font-sans selection:bg-brand selection:text-darker overflow-x-hidden">
      <HomeNavbar />
      <HeroSection />
      <PreviewSection />
      <FeatureSection />
      <ClaritySection />
      <TestimonialSection />
      <JournalSection />
      <CTASection />
      <Footer />
    </div>
  );
}
