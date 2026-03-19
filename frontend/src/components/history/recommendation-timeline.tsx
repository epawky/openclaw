'use client';

import React from 'react';
import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
  Package,
  Tag,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import type {
  RecommendationTimeline as TimelineData,
  RecommendationHistoryEvent,
  RecommendationEventType,
  ActionType,
} from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface RecommendationTimelineProps {
  timeline: TimelineData;
  isLoading?: boolean;
  className?: string;
}

interface TimelineEventProps {
  event: RecommendationHistoryEvent;
  isFirst: boolean;
  isLast: boolean;
}

// =============================================================================
// Event Icons & Styles
// =============================================================================

const eventIcons: Record<RecommendationEventType, React.ElementType> = {
  created: AlertCircle,
  viewed: Eye,
  accepted: CheckCircle2,
  dismissed: XCircle,
  action_queued: PlayCircle,
  action_started: PlayCircle,
  action_completed: CheckCircle2,
  action_failed: XCircle,
  reopened: AlertCircle,
  escalated: AlertCircle,
  outcome_recorded: TrendingUp,
};

const eventStyles: Record<RecommendationEventType, { bg: string; icon: string; border: string }> = {
  created: { bg: 'bg-slate-100', icon: 'text-slate-600', border: 'border-slate-300' },
  viewed: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-300' },
  accepted: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-300' },
  dismissed: { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-300' },
  action_queued: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-300' },
  action_started: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-300' },
  action_completed: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-300' },
  action_failed: { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-300' },
  reopened: { bg: 'bg-orange-100', icon: 'text-orange-600', border: 'border-orange-300' },
  escalated: { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-300' },
  outcome_recorded: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-300' },
};

const eventLabels: Record<RecommendationEventType, string> = {
  created: 'Created',
  viewed: 'Viewed',
  accepted: 'Accepted',
  dismissed: 'Dismissed',
  action_queued: 'Action Queued',
  action_started: 'Action Started',
  action_completed: 'Action Completed',
  action_failed: 'Action Failed',
  reopened: 'Reopened',
  escalated: 'Escalated',
  outcome_recorded: 'Outcome Recorded',
};

const actionIcons: Record<ActionType, React.ElementType> = {
  reorder_inventory: Package,
  launch_promotion: Tag,
  queue_retention_campaign: Users,
  mark_for_review: Eye,
  dismiss_recommendation: XCircle,
};

const actionLabels: Record<ActionType, string> = {
  reorder_inventory: 'Reorder Inventory',
  launch_promotion: 'Launch Promotion',
  queue_retention_campaign: 'Retention Campaign',
  mark_for_review: 'Marked for Review',
  dismiss_recommendation: 'Dismissed',
};

// =============================================================================
// Timeline Event Component
// =============================================================================

function TimelineEvent({ event, isFirst, isLast }: TimelineEventProps) {
  const Icon = eventIcons[event.eventType];
  const styles = eventStyles[event.eventType];
  const ActionIcon = event.metadata?.actionType ? actionIcons[event.metadata.actionType as ActionType] : null;

  return (
    <div className="relative flex gap-4">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2',
          styles.bg,
          styles.border
        )}
      >
        <Icon className={cn('h-4 w-4', styles.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900">
              {eventLabels[event.eventType]}
            </span>
            {event.metadata?.actionType != null && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                {ActionIcon && <ActionIcon className="h-3 w-3" />}
                {actionLabels[event.metadata.actionType as ActionType]}
              </Badge>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {formatRelativeTime(event.createdAt)}
          </span>
        </div>

        {/* Event-specific details */}
        {event.metadata && (
          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
            {event.eventType === 'action_queued' && event.metadata.actionSummary != null && (
              <p className="text-slate-700">{String(event.metadata.actionSummary)}</p>
            )}

            {event.eventType === 'action_completed' && (
              <div className="space-y-1">
                {event.metadata.actionSummary != null && (
                  <p className="text-slate-700">{String(event.metadata.actionSummary)}</p>
                )}
                {event.metadata.resultData != null && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                    {(event.metadata.resultData as Record<string, unknown>).quantity != null && (
                      <span>Quantity: {String((event.metadata.resultData as Record<string, unknown>).quantity)}</span>
                    )}
                    {(event.metadata.resultData as Record<string, unknown>).projectedRevenue != null && (
                      <span>
                        Est. Revenue: ${Number((event.metadata.resultData as Record<string, unknown>).projectedRevenue).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {event.eventType === 'action_failed' && event.metadata.errorMessage != null && (
              <p className="text-red-600">{String(event.metadata.errorMessage)}</p>
            )}

            {event.eventType === 'dismissed' && event.metadata.reason != null && (
              <p className="text-slate-600">Reason: {String(event.metadata.reason)}</p>
            )}

            {event.eventType === 'outcome_recorded' && (
              <div className="space-y-2">
                {event.metadata.actualRevenue != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Actual Revenue:</span>
                    <span className="font-medium text-slate-900">
                      ${Number(event.metadata.actualRevenue).toLocaleString()}
                    </span>
                    {event.metadata.projectedRevenue != null && (
                      <span className={cn(
                        'text-xs',
                        Number(event.metadata.actualRevenue) >= Number(event.metadata.projectedRevenue)
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}>
                        ({Number(event.metadata.actualRevenue) >= Number(event.metadata.projectedRevenue) ? '+' : ''}
                        {(((Number(event.metadata.actualRevenue) - Number(event.metadata.projectedRevenue)) / Number(event.metadata.projectedRevenue)) * 100).toFixed(1)}% vs projected)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Status Summary Component
// =============================================================================

function StatusSummary({ timeline }: { timeline: TimelineData }) {
  const { currentStatus, events, actionsExecuted, totalDuration } = timeline;

  const statusStyles: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    accepted: { bg: 'bg-green-100', text: 'text-green-800' },
    dismissed: { bg: 'bg-slate-100', text: 'text-slate-800' },
    queued: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    monitoring: { bg: 'bg-purple-100', text: 'text-purple-800' },
  };

  const styles = statusStyles[currentStatus] || statusStyles.open;
  const totalEvents = events.length;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
      <div className="flex items-center gap-3">
        <Badge className={cn('capitalize', styles.bg, styles.text)}>
          {currentStatus.replace('_', ' ')}
        </Badge>
        <span className="text-sm text-slate-600">
          {totalEvents} event{totalEvents !== 1 ? 's' : ''} recorded
        </span>
        {actionsExecuted > 0 && (
          <span className="text-sm text-slate-500">
            • {actionsExecuted} action{actionsExecuted !== 1 ? 's' : ''} taken
          </span>
        )}
      </div>
      {totalDuration && totalDuration > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(totalDuration)}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

// =============================================================================
// Main Timeline Component
// =============================================================================

export function RecommendationTimeline({
  timeline,
  isLoading = false,
  className,
}: RecommendationTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!timeline.events.length) {
    return (
      <div className={cn('text-center py-8', className)}>
        <FileCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No history available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Summary */}
      <StatusSummary timeline={timeline} />

      {/* Timeline Events */}
      <div className="space-y-0">
        {timeline.events.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isFirst={index === 0}
            isLast={index === timeline.events.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Compact Timeline (for inline display)
// =============================================================================

interface CompactTimelineProps {
  events: RecommendationHistoryEvent[];
  maxEvents?: number;
  className?: string;
}

export function CompactTimeline({
  events,
  maxEvents = 3,
  className,
}: CompactTimelineProps) {
  const displayEvents = events.slice(0, maxEvents);
  const remainingCount = events.length - maxEvents;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {displayEvents.map((event, index) => {
        const Icon = eventIcons[event.eventType];
        const styles = eventStyles[event.eventType];
        return (
          <div
            key={event.id}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full',
              styles.bg
            )}
            title={`${eventLabels[event.eventType]} - ${formatRelativeTime(event.createdAt)}`}
          >
            <Icon className={cn('h-3 w-3', styles.icon)} />
          </div>
        );
      })}
      {remainingCount > 0 && (
        <span className="text-xs text-slate-500">+{remainingCount} more</span>
      )}
    </div>
  );
}
