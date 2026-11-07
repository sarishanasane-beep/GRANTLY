import React, { useEffect, useRef } from 'react';
import ParticleDrift from '@/components/originkit/ui/particle-drift-03';
import { useAppStore } from '@/store/useAppStore';

/**
 * SiteBackground
 *
 * Single, globally-mounted ambient background for GRANTLY integrating Originkit Particle Drift 3.
 * Mounted exactly once in App.tsx behind all website routes.
 *
 * Strict 5-Layer Stacking Architecture:
 * - Layer 0 (z-0): #0B0F0D solid base
 * - Layer 1 (z-0): Actual Originkit Particle Drift 3 (Sage / Champagne interactive constellation)
 * - Layer 2 (z-0): Subtle atmospheric vignette & architectural depth (transparent center)
 * - Layer 3 (z-10): All page content (transparent page roots, solid cards & forms)
 * - Layer 4 (z-40/50): Navigation, modal dialogs, and controls
 */
export const SiteBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useAppStore((state) => state.settings.reducedMotion);

  useEffect(() => {
    // Locate the WebGL canvas rendered by Originkit ParticleDrift
    if (containerRef.current) {
      canvasRef.current = containerRef.current.querySelector('canvas');
    }

    // Direct, zero-latency pointer event forwarding from window to WebGL canvas.
    // The container uses pointer-events-none so it CANNOT intercept clicks or touches on buttons/forms,
    // while this window listener forwards clientX/clientY coordinates directly to the canvas event listeners.
    const handlePointerMove = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: false,
          cancelable: true,
        })
      );
    };

    const handlePointerEnter = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.dispatchEvent(
        new PointerEvent('pointerenter', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: false,
          cancelable: true,
        })
      );
    };

    const handlePointerLeave = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    document.documentElement.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerenter', handlePointerEnter);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Layer 0: #0B0F0D Base */}
      <div className="absolute inset-0 bg-[#0B0F0D]" />

      {/* Layer 1: Actual Originkit Particle Drift 3 WebGL Field */}
      <div className="absolute inset-0 w-full h-full">
        <ParticleDrift
          background="transparent"
          baseColor="#8CA98C"       // Sage Green (#8CA98C) for resting particles and inter-particle web
          accentColor="#D9C7A3"     // Champagne Gold (#D9C7A3) for pointer illumination and pointer connection lines
          density={reducedMotion ? 40 : 160} // Rich, elegant constellation field
          dotSize={2.8}             // Crisp, clearly visible floating embers (not microscopic)
          speed={reducedMotion ? 0 : 25}     // Calm, steady downward gravitational drift
          direction={0}             // Downward drift (0 = down)
          hover={120}               // Responsive cursor interaction
          linkDistance={115}        // Inter-particle webbing distance
          linkThickness={1.0}       // Delicate web lines
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            background: 'transparent',
          }}
        />
      </div>

      {/* Layer 2: Subtle Atmospheric Vignette & Contrast Depth (Completely transparent in center) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_65%,rgba(11,15,13,0.35)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0F0D]/40 pointer-events-none" />
    </div>
  );
};

export default SiteBackground;
