'use client';

import React from 'react';
import { ArrowRight, AlertCircle, Package, TrendingUp, Tag, Users, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Recommendation, PriorityLevel, RecommendationType, ConfidenceLevel, RecommendationStatus } from '@/lib/types';

interface RecommendationsTableProps {
  recommendations: Recommendation[];
  onRowClick?: (recommendation: Recommendation) => void;
  showStatus?: boolean;
  compact?: boolean;
}

const priorityStyles: Record<PriorityLevel, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const statusStyles: Record<RecommendationStatus, string> = {
  pending: 'status-pending',
  accepted: 'status-accepted',
  dismissed: 'status-dismissed',
  in_progress: 'status-in-progress',
};

const typeIcons: Record<RecommendationType, React.ElementType> = {
  stockout_risk: AlertCircle,
  slow_mover: Package,
  promotion_opportunity: TrendingUp,
  pricing_adjustment: Tag,
  customer_retention: Users,
  bundle_opportunity: Layers,
  reorder_suggestion: Package,
};

const typeLabels: Record<RecommendationType, string> = {
  stockout_risk: 'Stockout Risk',
  slow_mover: 'Slow Mover',
  promotion_opportunity: 'Promotion',
  pricing_adjustment: 'Pricing',
  customer_retention: 'Retention',
  bundle_opportunity: 'Bundle',
  reorder_suggestion: 'Reorder',
};

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'confidence-high',
  medium: 'confidence-medium',
  low: 'confidence-low',
};

export function RecommendationsTable({
  recommendations,
  onRowClick,
  showStatus = true,
  compact = false,
}: RecommendationsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--cartex-muted)' }}>
          Top Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cartex-border)', backgroundColor: 'var(--cartex-surface)' }}>
                <th className="table-header px-4 py-3 text-left">#</th>
                <th className="table-header px-4 py-3 text-left">Type</th>
                <th className="table-header px-4 py-3 text-left">Recommendation</th>
                {!compact && <th className="table-header px-4 py-3 text-left">Impact</th>}
                <th className="table-header px-4 py-3 text-center">Confidence</th>
                {showStatus && <th className="table-header px-4 py-3 text-center">Status</th>}
                <th className="table-header px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => {
                const TypeIcon = typeIcons[rec.type];
                return (
                  <tr
                    key={rec.id}
                    onClick={() => onRowClick?.(rec)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-[var(--cartex-surface)]'
                    )}
                    style={{ borderBottom: '1px solid var(--cartex-border)' }}
                  >
                    <td className="px-4 py-3">
                      <Badge className={priorityStyles[rec.priority]}>
                        {rec.priorityRank}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" style={{ color: 'var(--cartex-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--cartex-muted)' }}>{typeLabels[rec.type]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--cartex-text)' }}>{rec.title}</p>
                        <p className="text-xs" style={{ color: 'var(--cartex-muted)' }}>{rec.entity}</p>
                      </div>
                    </td>
                    {!compact && (
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>{rec.impactEstimate}</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-medium', confidenceStyles[rec.confidence])}>
                        {rec.confidence}
                      </span>
                    </td>
                    {showStatus && (
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn('capitalize', statusStyles[rec.status])}>
                          {rec.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      {onRowClick && (
                        <ArrowRight className="inline-block h-4 w-4" style={{ color: 'var(--cartex-muted)' }} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
