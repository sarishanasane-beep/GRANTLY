import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'gold' | 'neutral' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'emerald',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors';

  const variants = {
    emerald: 'bg-[#3E5A3F]/25 text-[#8CA98C] border border-[#3E5A3F]/50',
    gold: 'bg-[#D9C7A3]/15 text-[#D9C7A3] border border-[#D9C7A3]/30',
    neutral: 'bg-[#1F2A1F] text-[#8CA98C] border border-[#263427]',
    success: 'bg-[#3E5A3F]/30 text-[#D9C7A3] border border-[#3E5A3F]/60',
    warning: 'bg-[#B08D57]/20 text-[#D9C7A3] border border-[#B08D57]/40',
    danger: 'bg-red-950/40 text-red-300 border border-red-800/40',
    outline: 'border border-[#263427] text-[#F5F7F5]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
