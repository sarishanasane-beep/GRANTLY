import React from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

/**
 * CinematicBackground
 *
 * Implements the permanent GRANTLY luxury dark environment without Ferrofluid:
 * - Base: #0B0F0D (grantly-black)
 * - 6 gradually shifting ambient lighting environments synchronized with scroll
 * - Scrub-smoothed continuous interpolation (~1.8s easing lag)
 * - Subtle fine SVG noise grain (opacity 0.025, overlay)
 * - Dark atmospheric vignette and restrained architectural micro-grid
 */
export const CinematicBackground: React.FC = () => {
  const reducedMotionSetting = useAppStore((state) => state.settings.reducedMotion);
  const prefersReduced = useReducedMotion();
  const shouldReduceMotion = prefersReduced || reducedMotionSetting;

  const { scrollYProgress } = useScroll();

  // Smooth scrub interpolator: 1.5 - 2s gentle lag behind raw scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 24,
    restDelta: 0.0001,
  });

  // Interpolate primary ambient radial glow position & color across the 6 environments:
  // 1. Hero (0.0): Deep black / forest (#3E5A3F / #0B0F0D)
  // 2. Discovery (0.2): Forest-green (#3E5A3F / #1F2A1F)
  // 3. Eligibility (0.38): Dark sage-green (#8CA98C / #1F2A1F)
  // 4. Tracker (0.56): Deep forest application environment (#1F2A1F / #3E5A3F)
  // 5. Knowledge (0.74): Champagne-accented (#D9C7A3 / #B08D57)
  // 6. Final CTA (1.0): Dark final invitation with gold detailing (#B08D57 / #0B0F0D)

  // Glow 1 coordinates & colors
  const glow1X = useTransform(smoothProgress, [0, 0.2, 0.38, 0.56, 0.74, 1.0], ['50%', '35%', '65%', '30%', '70%', '50%']);
  const glow1Y = useTransform(smoothProgress, [0, 0.2, 0.38, 0.56, 0.74, 1.0], ['28%', '42%', '45%', '50%', '48%', '55%']);
  const glow1Color = useTransform(
    smoothProgress,
    [0, 0.2, 0.38, 0.56, 0.74, 1.0],
    [
      'rgba(62, 90, 63, 0.16)',   // grantly-forest
      'rgba(62, 90, 63, 0.22)',   // forest-green
      'rgba(140, 169, 140, 0.17)', // dark sage
      'rgba(31, 42, 31, 0.32)',   // deep forest
      'rgba(217, 199, 163, 0.14)', // champagne
      'rgba(176, 141, 87, 0.15)',  // gold
    ]
  );

  // Glow 2 secondary counter-point light
  const glow2X = useTransform(smoothProgress, [0, 0.2, 0.38, 0.56, 0.74, 1.0], ['70%', '65%', '30%', '70%', '30%', '50%']);
  const glow2Y = useTransform(smoothProgress, [0, 0.2, 0.38, 0.56, 0.74, 1.0], ['45%', '60%', '55%', '45%', '58%', '40%']);
  const glow2Color = useTransform(
    smoothProgress,
    [0, 0.2, 0.38, 0.56, 0.74, 1.0],
    [
      'rgba(31, 42, 31, 0.12)',
      'rgba(140, 169, 140, 0.10)',
      'rgba(217, 199, 163, 0.08)',
      'rgba(62, 90, 63, 0.15)',
      'rgba(176, 141, 87, 0.11)',
      'rgba(62, 90, 63, 0.16)',
    ]
  );

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#0B0F0D]" aria-hidden="true">
      {/* 1. Base Layer: Solid Obsidian-Forest Void */}
      <div className="absolute inset-0 bg-[#0B0F0D]" />

      {/* 2. Primary Ambient Radial Glow (Smooth Scrubbed Transitions) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: shouldReduceMotion
            ? 'radial-gradient(ellipse 65% 55% at 50% 30%, rgba(62, 90, 63, 0.18) 0%, rgba(11, 15, 13, 0) 80%)'
            : useTransform(
                [glow1X, glow1Y, glow1Color],
                ([x, y, color]) =>
                  `radial-gradient(ellipse 65% 55% at ${x} ${y}, ${color} 0%, rgba(11, 15, 13, 0) 75%)`
              ),
        }}
      />

      {/* 3. Secondary Warm Counter-Light Glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: shouldReduceMotion
            ? 'radial-gradient(ellipse 55% 45% at 65% 45%, rgba(31, 42, 31, 0.14) 0%, rgba(11, 15, 13, 0) 70%)'
            : useTransform(
                [glow2X, glow2Y, glow2Color],
                ([x, y, color]) =>
                  `radial-gradient(ellipse 55% 45% at ${x} ${y}, ${color} 0%, rgba(11, 15, 13, 0) 70%)`
              ),
        }}
      />

      {/* 4. Fine Architectural Micro-Grid (Extremely faint, fades out at edges) */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3E5A3F 1px, transparent 1px),
            linear-gradient(to bottom, #3E5A3F 1px, transparent 1px)
          `,
          backgroundSize: '128px 128px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
        }}
      />

      {/* 5. Subtle Organic Noise Grain Layer */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.024] mix-blend-overlay">
        <filter id="grantlyNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grantlyNoise)" />
      </svg>

      {/* 6. Dark Atmospheric Vignette (Prevents any edge glow or hotspot) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(11,15,13,0.85)_100%)]" />
    </div>
  );
};

export default CinematicBackground;
