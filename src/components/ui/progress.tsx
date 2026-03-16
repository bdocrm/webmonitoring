'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn('w-full h-2 bg-secondary rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full transition-all duration-500 rounded-full',
          getColor(percentage),
          animated && 'animate-pulse'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
