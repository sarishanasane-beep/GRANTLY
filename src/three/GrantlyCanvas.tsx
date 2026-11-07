import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { GrantlyHeroScene } from './scenes/GrantlyHeroScene';
import { GlobalLoader } from '../components/loading/GlobalLoader';

interface GrantlyCanvasProps {
  className?: string;
  reducedMotion?: boolean;
}

export const GrantlyCanvas: React.FC<GrantlyCanvasProps> = ({
  className = 'w-full h-full min-h-[420px]',
  reducedMotion = false,
}) => {
  // Adaptive DPR clamped to max 1.8 for performance
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return [1, 1.5] as [number, number];
    return [1, Math.min(1.8, window.devicePixelRatio || 1)] as [number, number];
  }, []);

  return (
    <div className={`relative ${className} overflow-hidden pointer-events-auto`} aria-hidden="true">
      <Suspense
        fallback={<GlobalLoader variant="local3d" label="INITIALIZING 3D ENVIRONMENT" />}
      >
        <Canvas
          dpr={dpr}
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          frameloop={reducedMotion ? 'demand' : 'always'}
        >
          <GrantlyHeroScene reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GrantlyCanvas;
