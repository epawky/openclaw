'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  AlertTriangle,
  Info,
  Package,
  Users,
  DollarSign,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import { api } from '@/lib/api';
import type {
  ChangeEvent,
  ChangeSummary,
  ChangeSignificance,
  ChangeDirection,
  ChangeEntityType,
  ChangeType,
} from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface WhatChangedSectionProps {
  className?: string;
  maxItems?: number;
  onViewAll?: () => void;
}

// =============================================================================
// Icons & Styles
// =============================================================================

const directionIcons: Record<ChangeDirection, React.ElementType> = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
};

const directionStyles: Record<ChangeDirection, string> = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-slate-500',
};

const significanceStyles: Record<ChangeSignificance, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const significanceIcons: Record<ChangeSignificance, React.ElementType> = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
};

const entityIcons: Record<ChangeEntityType, React.ElementType> = {
  store: DollarSign,
  sku: Package,
  cohort: Users,
  customer_segment: Users,
  product_category: Package,
};

const changeTypeLabels: Partial<Record<ChangeType, string>> = {
  revenue_up: 'Revenue Up',
  revenue_down: 'Revenue Down',
  orders_up: 'Orders Up',
  orders_down: 'Orders Down',
  aov_up: 'AOV Up',
  aov_down: 'AOV Down',
  repeat_rate_up: 'Repeat Rate Up',
  repeat_rate_down: 'Repeat Rate Down',
  sku_demand_up: 'SKU Demand Up',
  sku_demand_down: 'SKU Demand Down',
  new_stockout_risk: 'Stockout Risk',
  stockout_resolved: 'Stockout Resolved',
  slow_mover_worsened: 'Slow Mover',
  slow_mover_improved: 'Slow Mover Improved',
  cohort_retention_dropped: 'Retention Drop',
  cohort_retention_improved: 'Retention Improved',
};

// =============================================================================
// Change Item Component
// =============================================================================

interface ChangeItemProps {
  change: ChangeEvent;
  compact?: boolean;
}

function ChangeItem({ change, compact = false }: ChangeItemProps) {
  const DirectionIcon = directionIcons[change.direction];
  const SignificanceIcon = significanceIcons[change.significance];
  const EntityIcon = entityIcons[change.entityType];
  const styles = significanceStyles[change.significance];

  // Build description from evidence if available
  const description = change.evidence?.[0]?.description || change.metricName;

  if (compact) {
    return (
      <div className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        styles.bg,
        styles.border
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('flex-shrink-0', directionStyles[change.direction])}>
            <DirectionIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {description}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-xs">
                {changeTypeLabels[change.changeType] || change.metricName}
              </Badge>
              {change.entityName && (
                <span className="text-xs text-slate-500 truncate">{change.entityName}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={cn('text-sm font-semibold', directionStyles[change.direction])}>
            {change.percentChange > 0 ? '+' : ''}
            {change.percentChange.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      styles.bg,
      styles.border
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
            change.direction === 'positive' ? 'bg-green-100' :
            change.direction === 'negative' ? 'bg-red-100' : 'bg-slate-100'
          )}>
            <DirectionIcon className={cn('h-4 w-4', directionStyles[change.direction])} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', styles.bg, styles.text, 'border', styles.border)}>
                <SignificanceIcon className="h-3 w-3 mr-1" />
                {change.significance}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <EntityIcon className="h-3 w-3 mr-1" />
                {changeTypeLabels[change.changeType] || change.metricName}
              </Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {description}
            </p>
            {change.entityName && (
              <p className="mt-1 text-xs text-slate-500">
                Entity: {change.entityName}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={cn('text-lg font-bold', directionStyles[change.direction])}>
            {change.percentChange > 0 ? '+' : ''}
            {change.percentChange.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500 mt-1">
            {formatRelativeTime(change.detectedAt)}
          </span>
        </div>
      </div>

      {/* Period comparison */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="text-slate-500">Previous:</span>{' '}
            <span className="font-medium">
              {formatValue(change.priorValue, change.changeType)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Current:</span>{' '}
            <span className="font-medium">
              {formatValue(change.currentValue, change.changeType)}
            </span>
          </div>
          <div className="text-slate-400">
            {change.absoluteChange > 0 ? '+' : ''}{change.absoluteChange.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Summary Stats Component
// =============================================================================

interface SummaryStatsProps {
  summary: ChangeSummary;
}

function SummaryStats({ summary }: SummaryStatsProps) {
  const highCount = summary.byCategory.inventory.filter(c => c.significance === 'high').length +
    summary.byCategory.revenue.filter(c => c.significance === 'high').length +
    summary.byCategory.customers.filter(c => c.significance === 'high').length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {summary.criticalChanges > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-xs text-red-600">Critical</p>
            <p className="text-sm font-semibold text-red-700">{summary.criticalChanges}</p>
          </div>
        </div>
      )}
      {highCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <div>
            <p className="text-xs text-orange-600">High</p>
            <p className="text-sm font-semibold text-orange-700">{highCount}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <div>
          <p className="text-xs text-green-600">Improved</p>
          <p className="text-sm font-semibold text-green-700">{summary.positiveChanges.length}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <TrendingDown className="h-4 w-4 text-red-600" />
        <div>
          <p className="text-xs text-red-600">Declined</p>
          <p className="text-sm font-semibold text-red-700">{summary.negativeChanges.length}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatValue(value: number, changeType: ChangeType): string {
  if (changeType.includes('revenue') || changeType.includes('aov') || changeType.includes('ltv')) {
    return `$${value.toLocaleString()}`;
  }
  if (changeType.includes('rate') || changeType.includes('retention') || changeType.includes('conversion')) {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}

// =============================================================================
// Main Component
// =============================================================================

export function WhatChangedSection({
  className,
  maxItems = 5,
  onViewAll,
}: WhatChangedSectionProps) {
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [summary, setSummary] = useState<ChangeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const [changesRes, summaryRes] = await Promise.all([
        api.changes.getLatest(maxItems),
        api.changes.getSummary(),
      ]);
      setChanges(changesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load changes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, [maxItems]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-slate-900">What Changed</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-slate-900">What Changed</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchChanges}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (changes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-slate-900">What Changed</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No significant changes detected</p>
            <p className="text-xs text-slate-400 mt-1">
              Changes are detected by comparing 7-day and 30-day performance windows
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">What Changed</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Significant changes since last analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchChanges}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onViewAll && (
              <Button variant="outline" size="sm" onClick={onViewAll}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {summary && summary.criticalChanges > 0 && (
          <SummaryStats summary={summary} />
        )}

        {/* Changes List */}
        <div className="space-y-3">
          {changes.map((change) => (
            <ChangeItem key={change.id} change={change} compact />
          ))}
        </div>

        {/* View all link */}
        {summary && summary.totalChanges > maxItems && onViewAll && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View all {summary.totalChanges} changes
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Expanded Changes View (for dedicated page)
// =============================================================================

interface ExpandedChangesViewProps {
  className?: string;
}

export function ExpandedChangesView({ className }: ExpandedChangesViewProps) {
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [summary, setSummary] = useState<ChangeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ChangeSignificance | 'all'>('all');

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const [changesRes, summaryRes] = await Promise.all([
        api.changes.getLatest(50),
        api.changes.getSummary(),
      ]);
      setChanges(changesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load changes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  const filteredChanges = filter === 'all'
    ? changes
    : changes.filter((c) => c.significance === filter);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchChanges}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      {summary && <SummaryStats summary={summary} />}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((f) => {
          const getCount = () => {
            if (!summary) return 0;
            const allChanges = [...summary.positiveChanges, ...summary.negativeChanges];
            if (f === 'all') return allChanges.length;
            return allChanges.filter(c => c.significance === f).length;
          };
          return (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && summary && (
                <span className="ml-1 text-xs opacity-60">
                  ({getCount()})
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Changes List */}
      <div className="space-y-4">
        {filteredChanges.map((change) => (
          <ChangeItem key={change.id} change={change} />
        ))}
      </div>

      {filteredChanges.length === 0 && (
        <div className="text-center py-8">
          <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No changes match this filter</p>
        </div>
      )}
    </div>
  );
}
