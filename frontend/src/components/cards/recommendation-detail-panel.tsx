'use client';

import React from 'react';
import {
  X,
  AlertCircle,
  Package,
  TrendingUp,
  Tag,
  Users,
  Layers,
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Recommendation, PriorityLevel, RecommendationType, ConfidenceLevel } from '@/lib/types';

interface RecommendationDetailPanelProps {
  recommendation: Recommendation;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSimulate?: (id: string) => void;
}

const priorityStyles: Record<PriorityLevel, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
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
  promotion_opportunity: 'Promotion Opportunity',
  pricing_adjustment: 'Pricing Adjustment',
  customer_retention: 'Customer Retention',
  bundle_opportunity: 'Bundle Opportunity',
  reorder_suggestion: 'Reorder Suggestion',
};

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
};

const urgencyLabels: Record<string, string> = {
  immediate: 'Immediate',
  this_week: 'This Week',
  this_month: 'This Month',
  low: 'Low Priority',
};

export function RecommendationDetailPanel({
  recommendation,
  onClose,
  onAccept,
  onDismiss,
  onSimulate,
}: RecommendationDetailPanelProps) {
  const TypeIcon = typeIcons[recommendation.type];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-elevated border-l border-surface-border overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Badge className={cn('border', priorityStyles[recommendation.priority])}>
            #{recommendation.priorityRank}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TypeIcon className="h-4 w-4" />
            {typeLabels[recommendation.type]}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Title and Entity */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{recommendation.title}</h2>
          <p className="mt-1 text-sm text-slate-500">Entity: {recommendation.entity}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Target className="h-3.5 w-3.5" />
              Impact
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {recommendation.impactEstimate}
            </p>
          </div>
          <div className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Urgency
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {urgencyLabels[recommendation.urgency]}
            </p>
          </div>
          <div className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <BarChart3 className="h-3.5 w-3.5" />
              Confidence
            </div>
            <p className={cn('mt-1 text-sm font-semibold capitalize', confidenceColors[recommendation.confidence])}>
              {recommendation.confidence}
            </p>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{recommendation.summary}</p>
          </CardContent>
        </Card>

        {/* Why Flagged */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-slate-900">Why This Was Flagged</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{recommendation.why}</p>
          </CardContent>
        </Card>

        {/* Supporting Evidence */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-slate-900">Supporting Evidence</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendation.evidence.map((evidence, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{evidence.type}</p>
                    <p className="text-sm text-slate-600">{evidence.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Action */}
        <Card className="border-brand-200 bg-brand-50">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-brand-900">Recommended Action</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-brand-800 leading-relaxed">
              {recommendation.recommendedAction}
            </p>
          </CardContent>
        </Card>

        {/* Related Signals */}
        {recommendation.relatedSignals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Related Signals</h3>
            <div className="flex flex-wrap gap-2">
              {recommendation.relatedSignals.map((signal, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>Created: {formatRelativeTime(recommendation.createdAt)}</p>
          {recommendation.updatedAt !== recommendation.createdAt && (
            <p>Updated: {formatRelativeTime(recommendation.updatedAt)}</p>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      {recommendation.status === 'pending' && (
        <div className="sticky bottom-0 border-t border-surface-border bg-white p-4">
          <div className="flex gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onAccept?.(recommendation.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onDismiss?.(recommendation.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
            {recommendation.type === 'stockout_risk' && (
              <Button
                variant="secondary"
                onClick={() => onSimulate?.(recommendation.id)}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Simulate
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
