'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatPercent, formatNumber, formatDelta } from '@/lib/utils';
import type { KPIValue } from '@/lib/types';

interface KPICardProps {
  title: string;
  value: KPIValue;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function KPICard({ title, value, icon, onClick }: KPICardProps) {
  const delta = formatDelta(value.current, value.previous, 'percent');

  const formattedValue = (() => {
    switch (value.unit) {
      case 'currency':
        return formatCurrency(value.current);
      case 'percent':
        return formatPercent(value.current);
      default:
        return formatNumber(value.current);
    }
  })();

  const healthColors = {
    positive: 'bg-cartex-success/10 border-cartex-success/20',
    warning: 'bg-cartex-warning/10 border-cartex-warning/20',
    negative: 'bg-cartex-danger/10 border-cartex-danger/20',
    neutral: 'bg-cartex-surface border-cartex-border',
  };

  const deltaColors = {
    positive: 'text-cartex-success',
    negative: 'text-cartex-danger',
    neutral: 'text-cartex-muted',
  };

  return (
    <Card
      clickable={!!onClick}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all',
        healthColors[value.healthState]
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-cartex-muted">{title}</p>
            <p className="text-2xl font-semibold text-cartex-text">{formattedValue}</p>
          </div>
          {icon && (
            <div className="rounded-lg bg-cartex-elevated p-2 text-cartex-muted">{icon}</div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          {delta.isZero ? (
            <Minus className="h-4 w-4 text-cartex-tertiary" />
          ) : delta.isPositive ? (
            <TrendingUp className="h-4 w-4 text-cartex-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-cartex-danger" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              delta.isZero
                ? deltaColors.neutral
                : delta.isPositive
                ? deltaColors.positive
                : deltaColors.negative
            )}
          >
            {delta.value}
          </span>
          <span className="text-sm text-cartex-tertiary">vs last 7 days</span>
        </div>
      </CardContent>
    </Card>
  );
}
