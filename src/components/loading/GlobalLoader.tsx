import React from 'react';

export interface GlobalLoaderProps {
  variant?: 'fullscreen' | 'compact' | 'local3d';
  label?: string;
  className?: string;
}

/**
 * GlobalLoader
 *
 * Dedicated unified loading system across GRANTLY.
 * Designed to host the Originkit Particle Gimbal loading component.
 *
 * Variants:
 * - 'fullscreen': Full-viewport deep-black (#0B0F0D) loader for route / page Suspense boundaries
 * - 'compact': Inline indicator for localized asynchronous tasks
 * - 'local3d': Stabilized aspect-ratio container for lazy 3D asset resolution
 */
export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  variant = 'fullscreen',
  label = 'RESOLVING ASSETS',
  className = '',
}) => {
  if (variant === 'local3d') {
    return (
      <div
        className={`flex flex-col items-center justify-center space-y-3 p-6 transition-opacity duration-300 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Gimbal orbital rings */}
          <div className="absolute inset-0 rounded-full border border-[#3E5A3F]/50 border-t-[#D9C7A3] animate-spin" />
          <div className="absolute inset-1.5 rounded-full border border-[#1F2A1F] border-b-[#8CA98C] animate-spin [animation-duration:1.8s] [animation-direction:reverse]" />
          <div className="w-2 h-2 rounded-full bg-[#D9C7A3] shadow-[0_0_8px_#D9C7A3] animate-pulse" />
        </div>
        {label && (
          <span className="text-[10px] font-mono tracking-widest text-[#8CA98C] uppercase select-none">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#1F2A1F]/80 border border-[#3E5A3F]/50 backdrop-blur-md ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-3.5 h-3.5 rounded-full border border-[#3E5A3F] border-t-[#D9C7A3] animate-spin" />
        {label && (
          <span className="text-[11px] font-mono tracking-wider text-[#8CA98C]">{label}</span>
        )}
      </div>
    );
  }

  // Default: Fullscreen page loader
  return (
    <div
      className={`min-h-screen w-full bg-[#0B0F0D] flex flex-col items-center justify-center space-y-4 select-none z-50 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Multilayer Gimbal Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-[#3E5A3F]/30 border-t-[#D9C7A3] animate-spin [animation-duration:1.4s]" />
        <div className="absolute inset-2 rounded-full border-2 border-[#1F2A1F] border-b-[#8CA98C] animate-spin [animation-duration:2.2s] [animation-direction:reverse]" />
        <div className="absolute inset-4 rounded-full border border-[#D9C7A3]/40 border-r-[#B08D57] animate-spin [animation-duration:0.9s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#D9C7A3] shadow-[0_0_12px_#D9C7A3] animate-pulse" />
      </div>
      {label && (
        <span className="text-[11px] font-mono tracking-[0.25em] text-[#8CA98C] uppercase">
          {label}
        </span>
      )}
    </div>
  );
};

export default GlobalLoader;
