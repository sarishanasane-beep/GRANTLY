import React, { useEffect, useRef } from 'react';
import { startAssembleIntro, AssembleController } from '@/lib/assemble';

interface AssembleIntroProps {
  force?: boolean;
  onComplete?: () => void;
}

declare global {
  interface Window {
    __grantlyReplayIntro?: () => void;
  }
}

/**
 * AssembleIntro React Wrapper
 * Initializes the self-assembling 12-agent intro after initial DOM commit.
 * Handles React StrictMode cleanup and exposes window.__grantlyReplayIntro.
 */
export const AssembleIntro: React.FC<AssembleIntroProps> = ({ force = false, onComplete }) => {
  const controllerRef = useRef<AssembleController | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__grantlyReplayIntro = () => {
      if (controllerRef.current) {
        controllerRef.current.cancel();
      }
      controllerRef.current = startAssembleIntro({
        force: true,
        onComplete,
      });
    };

    // Small delay ensures critical app shell and initial loader have faded, and [data-assemble] nodes are measurable
    const timer = setTimeout(() => {
      controllerRef.current = startAssembleIntro({
        force,
        onComplete,
      });
    }, 750);

    return () => {
      clearTimeout(timer);
      if (controllerRef.current) {
        controllerRef.current.cancel();
        controllerRef.current = null;
      }
      window.__grantlyReplayIntro = () => {
        startAssembleIntro({ force: true });
      };
    };
  }, [force, onComplete]);

  return null;
};

export default AssembleIntro;
