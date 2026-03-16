'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  className,
}: KPICardProps) {
  const trendStyles = {
    up: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: '↑',
    },
    down: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: '↓',
    },
    neutral: {
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800/30',
      icon: '→',
    },
  };

  return (
    <Card className={cn(
      "card-hover border-border/50 bg-gradient-to-br from-card to-card/80",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-2xl p-2 bg-secondary/50 rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {unit && <div className="text-sm text-muted-foreground font-medium">{unit}</div>}
        </div>
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-1 text-xs mt-3 px-2 py-1 rounded-full font-medium',
            trendStyles[trend].bg,
            trendStyles[trend].color
          )}>
            <span>{trendStyles[trend].icon}</span>
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
