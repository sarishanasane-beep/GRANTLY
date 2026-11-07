import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { Button } from '@/components/ui/Button';
import { LEGAL_CONFIG } from '@/config/legal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  ChevronUp,
  FileText,
  Lock,
  Cookie,
  CreditCard,
} from 'lucide-react';

export const MarketingLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-dark-theme bg-transparent text-[#F5F7F5] min-h-screen flex flex-col selection:bg-[#3E5A3F]/50 selection:text-[#D9C7A3] relative z-10">
      <SkipToContent />

      {/* Elegant Studio Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-[#0B0F0D]/90 backdrop-blur-md border-b border-[#1F2A1F]/70 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* GRANTLY Brand Emblem */}
          <Link to="/" className="flex items-center space-x-2.5 group" data-assemble="brand-logo" aria-label="GRANTLY Home">
            <div className="w-8 h-8 rounded-lg bg-[#1F2A1F] border border-[#3E5A3F]/50 flex items-center justify-center text-[#D9C7A3] group-hover:border-[#D9C7A3]/60 group-hover:text-[#B08D57] transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-semibold text-lg tracking-tight text-[#F5F7F5] group-hover:text-[#D9C7A3] transition-colors">
                GRANTLY
              </span>
            </div>
          </Link>

          {/* Desktop Editorial Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-[0.2em] text-[#8CA98C]" data-assemble="nav-links" aria-label="Main Navigation">
            <Link to="/explore" className="hover:text-[#D9C7A3] transition-colors" data-assemble="nav-explore">
              Explore
            </Link>
            <Link to="/tracker" className="hover:text-[#D9C7A3] transition-colors">
              Tracker
            </Link>
            <Link to="/vault" className="hover:text-[#D9C7A3] transition-colors">
              Vault
            </Link>
            <Link to="/profile" className="hover:text-[#D9C7A3] transition-colors" data-assemble="nav-profile">
              Profile
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3" data-assemble="nav-cta">
            <Link to="/onboarding" className="hidden sm:inline-block">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="bg-[#D9C7A3] hover:bg-[#F5F7F5] text-[#0B0F0D] font-medium tracking-wide shadow-[0_0_20px_rgba(217,199,163,0.25)] text-xs px-4 py-2 rounded-full transition-all"
              >
                Get Started
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-muted hover:text-text hover:bg-surface-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#1F2A1F]/80 bg-[#0B0F0D]/95 backdrop-blur-xl px-4 py-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-mono uppercase tracking-wider text-[#8CA98C]" aria-label="Mobile Navigation">
              <Link to="/explore" className="p-2 rounded-lg hover:bg-surface-elevated hover:text-[#D9C7A3] transition-colors">
                Explore 36 Opportunities
              </Link>
              <Link to="/tracker" className="p-2 rounded-lg hover:bg-surface-elevated hover:text-[#D9C7A3] transition-colors">
                Application Tracker
              </Link>
              <Link to="/vault" className="p-2 rounded-lg hover:bg-surface-elevated hover:text-[#D9C7A3] transition-colors">
                Document Vault
              </Link>
              <Link to="/compare" className="p-2 rounded-lg hover:bg-surface-elevated hover:text-[#D9C7A3] transition-colors">
                Compare Schemes
              </Link>
              <Link to="/profile" className="p-2 rounded-lg hover:bg-surface-elevated hover:text-[#D9C7A3] transition-colors">
                Profile &amp; Privacy
              </Link>
            </nav>
            <div className="pt-2">
              <Link to="/onboarding" className="block w-full">
                <Button variant="primary" size="md" className="w-full bg-[#D9C7A3] text-[#0B0F0D]">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Marketing Viewport */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-[#1F2A1F]/90 border border-[#3E5A3F]/60 text-[#D9C7A3] shadow-xl hover:bg-[#3E5A3F] hover:text-[#F5F7F5] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary animate-in fade-in"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Comprehensive Editorial Footer */}
      <footer className="border-t border-[#1F2A1F] bg-[#0B0F0D] pt-12 pb-10 text-xs text-[#8CA98C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#1F2A1F]/60">
            <div className="space-y-1.5" data-assemble="footer-brand">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#3E5A3F]" />
                <span className="font-display font-semibold text-sm text-[#F5F7F5]">
                  {LEGAL_CONFIG.appName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F2A1F] text-[#D9C7A3] border border-[#3E5A3F]/40">
                  Academic Prototype
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#8CA98C] max-w-xl">
                {LEGAL_CONFIG.disclaimers.prototypeNotice}
              </p>
            </div>

            {/* Primary Platform Links */}
            <div className="flex flex-wrap items-center gap-6 text-[11px] font-mono uppercase tracking-wider text-[#8CA98C]" data-assemble="footer-links">
              <Link to="/explore" className="hover:text-[#D9C7A3] transition-colors">Explore</Link>
              <Link to="/tracker" className="hover:text-[#D9C7A3] transition-colors">Tracker</Link>
              <Link to="/compare" className="hover:text-[#D9C7A3] transition-colors">Compare</Link>
              <Link to="/vault" className="hover:text-[#D9C7A3] transition-colors">Vault</Link>
              <Link to="/profile" className="hover:text-[#D9C7A3] transition-colors">Profile</Link>
            </div>
          </div>

          {/* Legal, Privacy & Transparency Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8CA98C]/80">
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/privacy" className="hover:text-[#D9C7A3] transition-colors flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#3E5A3F]" />
                <span>Privacy Policy</span>
              </Link>
              <Link to="/terms" className="hover:text-[#D9C7A3] transition-colors flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#3E5A3F]" />
                <span>Terms of Service</span>
              </Link>
              <Link to="/cookies" className="hover:text-[#D9C7A3] transition-colors flex items-center gap-1">
                <Cookie className="w-3 h-3 text-[#3E5A3F]" />
                <span>Cookie &amp; Storage Disclosure</span>
              </Link>
              <Link to="/refund" className="hover:text-[#D9C7A3] transition-colors flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-[#3E5A3F]" />
                <span>Refund Policy</span>
              </Link>
            </div>

            <p className="font-mono text-[11px] text-muted">
              &copy; {LEGAL_CONFIG.currentYear} GRANTLY. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
