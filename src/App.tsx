import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

// Layouts
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { SiteBackground } from '@/components/background/SiteBackground';

// Landing page loaded eagerly for instant first paint
import { LandingPage } from '@/pages/LandingPage';

// Code-split internal application routes on demand
const DashboardPage = React.lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ExplorePage = React.lazy(() =>
  import('@/pages/ExplorePage').then((m) => ({ default: m.ExplorePage }))
);
const ScholarshipDetailPage = React.lazy(() =>
  import('@/pages/ScholarshipDetailPage').then((m) => ({ default: m.ScholarshipDetailPage }))
);
const TrackerPage = React.lazy(() =>
  import('@/pages/TrackerPage').then((m) => ({ default: m.TrackerPage }))
);
const DeadlinesPage = React.lazy(() =>
  import('@/pages/DeadlinesPage').then((m) => ({ default: m.DeadlinesPage }))
);
const VaultPage = React.lazy(() =>
  import('@/pages/VaultPage').then((m) => ({ default: m.VaultPage }))
);
const ComparePage = React.lazy(() =>
  import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage }))
);
const ProfilePage = React.lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const OnboardingPage = React.lazy(() =>
  import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);
const PrivacyPolicyPage = React.lazy(() =>
  import('@/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = React.lazy(() =>
  import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const CookiePolicyPage = React.lazy(() =>
  import('@/pages/CookiePolicyPage').then((m) => ({ default: m.CookiePolicyPage }))
);
const RefundPolicyPage = React.lazy(() =>
  import('@/pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage }))
);
const NotFoundPage = React.lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

import { GlobalLoader } from '@/components/loading/GlobalLoader';

const PageFallback: React.FC = () => (
  <GlobalLoader variant="fullscreen" label="RESOLVING ROUTE" />
);

export const App: React.FC = () => {
  // Fine-grained selector prevents full app re-renders on other store changes
  const theme = useAppStore((state) => state.settings.theme);

  // Initial application startup loader lifecycle
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialFading, setInitialFading] = useState(false);

  useEffect(() => {
    // Brief shell preparation: allows critical DOM and styles to register
    const fadeTimer = setTimeout(() => {
      setInitialFading(true);
    }, 450);

    const completeTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteBackground />

      {/* Critical Startup Shell Loader — fades out before 18-agent assembly begins */}
      {initialLoading && (
        <div
          className={`fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none ${
            initialFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <GlobalLoader variant="fullscreen" label="INITIALIZING APPLICATION SHELL" />
        </div>
      )}

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Marketing & Legal Routes with dedicated layout */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/refund" element={<RefundPolicyPage />} />
          </Route>

          {/* Internal Application Routes with shared responsive layout */}
          <Route element={<AppLayout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/scholarship/:id" element={<ScholarshipDetailPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/deadlines" element={<DeadlinesPage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
