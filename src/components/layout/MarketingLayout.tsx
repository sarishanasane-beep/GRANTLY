import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const MarketingLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-dark-theme bg-transparent text-[#F5F7F5] min-h-screen flex flex-col selection:bg-[#3E5A3F]/50 selection:text-[#D9C7A3] relative z-10">
      <SkipToContent />

      {/* Elegant Minimal Studio Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B0F0D]/85 backdrop-blur-md border-b border-[#1F2A1F]/70 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* GRANTLY Brand Emblem */}
          <Link to="/" className="flex items-center space-x-2.5 group" data-assemble="brand-logo">
            <div className="w-8 h-8 rounded-lg bg-[#1F2A1F] border border-[#3E5A3F]/50 flex items-center justify-center text-[#D9C7A3] group-hover:border-[#D9C7A3]/60 group-hover:text-[#B08D57] transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-semibold text-lg tracking-tight text-[#F5F7F5] group-hover:text-[#D9C7A3] transition-colors">
                GRANTLY
              </span>
            </div>
          </Link>

          {/* Minimal Editorial Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-[0.2em] text-[#8CA98C]" data-assemble="nav-links">
            <Link to="/explore" className="hover:text-[#D9C7A3] transition-colors" data-assemble="nav-explore">
              Explore
            </Link>
            <a href="#how-it-works" className="hover:text-[#D9C7A3] transition-colors" data-assemble="nav-how-it-works">
              How It Works
            </a>
            <a href="#about" className="hover:text-[#D9C7A3] transition-colors" data-assemble="nav-about">
              About
            </a>
            <Link to="/profile" className="hover:text-[#D9C7A3] transition-colors" data-assemble="nav-profile">
              Profile
            </Link>
          </nav>

          {/* Action Button: Get Started */}
          <div className="flex items-center space-x-3" data-assemble="nav-cta">
            <Link to="/onboarding">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="bg-[#D9C7A3] hover:bg-[#F5F7F5] text-[#0B0F0D] font-medium tracking-wide shadow-[0_0_20px_rgba(217,199,163,0.25)] text-xs px-4 py-2 rounded-full transition-all"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Marketing Viewport */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-[#1F2A1F] bg-[#0B0F0D] py-12 text-xs text-[#8CA98C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2" data-assemble="footer-brand">
            <ShieldCheck className="w-4 h-4 text-[#3E5A3F]" />
            <span className="font-mono text-[11px] text-[#8CA98C]">
              GRANTLY — Creative Education-Finance Prototype for THE OUTPOST Hackathon
            </span>
          </div>
          <div className="flex items-center space-x-6 text-[11px] font-mono uppercase tracking-wider text-[#8CA98C]" data-assemble="footer-links">
            <Link to="/explore" className="hover:text-[#D9C7A3] transition-colors">Explore</Link>
            <Link to="/tracker" className="hover:text-[#D9C7A3] transition-colors">Tracker</Link>
            <Link to="/compare" className="hover:text-[#D9C7A3] transition-colors">Compare</Link>
            <Link to="/vault" className="hover:text-[#D9C7A3] transition-colors">Vault</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
