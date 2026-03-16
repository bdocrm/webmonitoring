'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreGauge({
  score,
  maxScore = 100,
  label,
  size = 'md',
  className,
}: ScoreGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  const getColorClass = (pct: number) => {
    if (pct >= 80) return { stroke: '#22c55e', glow: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))' };
    if (pct >= 60) return { stroke: '#eab308', glow: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.5))' };
    if (pct >= 40) return { stroke: '#f97316', glow: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))' };
    return { stroke: '#ef4444', glow: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' };
  };

  const getTextColor = (pct: number) => {
    if (pct >= 80) return 'text-green-500';
    if (pct >= 60) return 'text-yellow-500';
    if (pct >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-lg', subtext: 'text-[10px]' },
    md: { container: 'w-32 h-32', text: 'text-3xl', subtext: 'text-xs' },
    lg: { container: 'w-48 h-48', text: 'text-5xl', subtext: 'text-sm' },
  };

  const colors = getColorClass(percentage);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <svg
          className={cn(sizeClasses[size].container, 'transform -rotate-90')}
          viewBox="0 0 120 120"
          style={{ filter: colors.glow }}
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-secondary/30"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={cn(sizeClasses[size].text, 'font-bold tracking-tight', getTextColor(percentage))}>
            {Math.round(score)}
          </span>
          <span className={cn(sizeClasses[size].subtext, 'text-muted-foreground font-medium')}>
            / {maxScore}
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold text-center text-foreground/80">{label}</p>
    </div>
  );
}
