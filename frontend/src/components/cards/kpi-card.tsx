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
    positive: 'bg-status-success-bg border-status-success/20',
    warning: 'bg-status-warning-bg border-status-warning/20',
    negative: 'bg-status-danger-bg border-status-danger/20',
    neutral: 'bg-slate-50 border-slate-200',
  };

  const deltaColors = {
    positive: 'text-status-success',
    negative: 'text-status-danger',
    neutral: 'text-slate-500',
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
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-semibold text-slate-900">{formattedValue}</p>
          </div>
          {icon && (
            <div className="rounded-lg bg-white/60 p-2 text-slate-600">{icon}</div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          {delta.isZero ? (
            <Minus className="h-4 w-4 text-slate-400" />
          ) : delta.isPositive ? (
            <TrendingUp className="h-4 w-4 text-status-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-status-danger" />
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
          <span className="text-sm text-slate-500">vs last 7 days</span>
        </div>
      </CardContent>
    </Card>
  );
}
