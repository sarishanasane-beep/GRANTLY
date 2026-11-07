import React from 'react';
import { cn } from '@/lib/utils';

export interface WizardStepProps {
  stepNumber: number;
  currentStep: number;
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  stepNumber,
  currentStep,
  title,
  description,
  isCompleted = false,
}) => {
  const isActive = stepNumber === currentStep;
  const isPast = stepNumber < currentStep || isCompleted;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
          isActive && 'bg-primary text-forest-void shadow-glow-emerald ring-2 ring-primary/40',
          isPast && !isActive && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          !isActive && !isPast && 'bg-surface-elevated text-muted border border-border'
        )}
      >
        {stepNumber}
      </div>
      <div>
        <p className={cn('text-xs font-semibold', isActive ? 'text-text' : 'text-muted')}>
          {title}
        </p>
        {description && <p className="text-[10px] text-muted">{description}</p>}
      </div>
    </div>
  );
};
