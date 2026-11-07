import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-primary shadow-glow-emerald">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-text">404</h1>
        <h2 className="text-xl font-bold text-text">Opportunity Route Not Found</h2>
        <p className="text-xs text-muted max-w-md mx-auto">
          The requested page coordinates do not exist in the GRANTLY network. Return to the portal dashboard or explore the scholarship catalog.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Overview
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="primary" size="sm" leftIcon={<Compass className="w-4 h-4" />}>
            Explore Schemes
          </Button>
        </Link>
      </div>
    </div>
  );
};
