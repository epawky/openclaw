'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OperatingBrief, PriorityLevel } from '@/lib/types';

interface BriefCardProps {
  brief: OperatingBrief;
  onActionClick?: (recommendationId: string) => void;
  onIssueClick?: (issueId: string) => void;
}

const severityIcons: Record<PriorityLevel, React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4 text-red-500" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  medium: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  low: <AlertTriangle className="h-4 w-4 text-blue-500" />,
};

const severityColors: Record<PriorityLevel, string> = {
  critical: 'bg-red-50 border-red-200',
  high: 'bg-orange-50 border-orange-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-blue-50 border-blue-200',
};

export function BriefCard({ brief, onActionClick, onIssueClick }: BriefCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-brand-50 to-white pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-brand-600" />
              AI COO Brief
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Generated {brief.dataFreshness}
            </p>
          </div>
          <Badge
            variant={brief.confidence === 'high' ? 'success' : brief.confidence === 'medium' ? 'warning' : 'secondary'}
          >
            {brief.confidence} confidence
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Summary */}
        <div>
          <p className="text-sm leading-relaxed text-slate-700">{brief.summary}</p>
        </div>

        {/* Top Issues */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Top Issues
          </h4>
          <ul className="space-y-2">
            {brief.topIssues.map((issue) => (
              <li
                key={issue.id}
                onClick={() => onIssueClick?.(issue.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                  severityColors[issue.severity],
                  onIssueClick && 'cursor-pointer hover:bg-white/50'
                )}
              >
                {severityIcons[issue.severity]}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{issue.title}</p>
                  <p className="text-xs text-slate-500">{issue.category}</p>
                </div>
                {onIssueClick && <ArrowRight className="h-4 w-4 text-slate-400" />}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {brief.topActions.map((action) => (
              <li
                key={action.id}
                onClick={() => action.recommendationId && onActionClick?.(action.recommendationId)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/50 p-3 transition-colors',
                  onActionClick && action.recommendationId && 'cursor-pointer hover:bg-green-50'
                )}
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  {brief.topActions.indexOf(action) + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{action.title}</p>
                  <p className="text-xs text-green-700">{action.impact}</p>
                </div>
                {onActionClick && action.recommendationId && (
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Analysis period: {new Date(brief.dateRange.start).toLocaleDateString()} -{' '}
              {new Date(brief.dateRange.end).toLocaleDateString()}
            </span>
          </div>
          <Button variant="outline" size="sm">
            View Full Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
