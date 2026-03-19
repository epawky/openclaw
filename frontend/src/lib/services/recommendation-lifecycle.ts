// =============================================================================
// Recommendation Lifecycle Tracking Service
// =============================================================================
// Tracks recommendation state changes and maintains history for demo mode
// =============================================================================

import type {
  Recommendation,
  RecommendationLifecycleStatus,
  RecommendationEventType,
  RecommendationHistoryEvent,
  RecommendationWithLifecycle,
  RecommendationTimeline,
  ActionExecution,
  ActionType,
} from '@/lib/types';

// =============================================================================
// In-Memory Storage for Demo Mode
// =============================================================================

let historyEvents: RecommendationHistoryEvent[] = [];
let historyIdCounter = 1;

// Status mapping from old to new
const STATUS_TO_LIFECYCLE: Record<string, RecommendationLifecycleStatus> = {
  pending: 'open',
  accepted: 'accepted',
  dismissed: 'dismissed',
  in_progress: 'queued',
};

export function resetRecommendationHistory(): void {
  historyEvents = [];
  historyIdCounter = 1;
}

// =============================================================================
// Event Generation
// =============================================================================

function generateHistoryId(): string {
  return `hist_${String(historyIdCounter++).padStart(4, '0')}`;
}

export function createHistoryEvent(
  recommendationId: string,
  eventType: RecommendationEventType,
  options: {
    previousStatus?: RecommendationLifecycleStatus;
    newStatus?: RecommendationLifecycleStatus;
    summary: string;
    actionExecutionId?: string;
    metadata?: Record<string, unknown>;
    createdBy?: string;
  }
): RecommendationHistoryEvent {
  const event: RecommendationHistoryEvent = {
    id: generateHistoryId(),
    recommendationId,
    eventType,
    previousStatus: options.previousStatus,
    newStatus: options.newStatus,
    summary: options.summary,
    actionExecutionId: options.actionExecutionId,
    metadata: options.metadata,
    createdAt: new Date().toISOString(),
    createdBy: options.createdBy,
  };

  historyEvents.push(event);
  return event;
}

// =============================================================================
// Record Events
// =============================================================================

export function recordCreatedEvent(recommendation: Recommendation): RecommendationHistoryEvent {
  return createHistoryEvent(recommendation.id, 'created', {
    newStatus: 'open',
    summary: `Recommendation created: ${recommendation.title}`,
    metadata: {
      type: recommendation.type,
      priority: recommendation.priority,
      impactValue: recommendation.impactValue,
    },
  });
}

export function recordViewedEvent(recommendationId: string): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'viewed', {
    summary: 'Recommendation viewed by user',
  });
}

export function recordAcceptedEvent(
  recommendationId: string,
  previousStatus: RecommendationLifecycleStatus
): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'accepted', {
    previousStatus,
    newStatus: 'accepted',
    summary: 'Recommendation accepted',
  });
}

export function recordDismissedEvent(
  recommendationId: string,
  previousStatus: RecommendationLifecycleStatus,
  reason?: string
): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'dismissed', {
    previousStatus,
    newStatus: 'dismissed',
    summary: reason ? `Dismissed: ${reason}` : 'Recommendation dismissed',
    metadata: { reason },
  });
}

export function recordActionQueuedEvent(
  recommendationId: string,
  execution: ActionExecution
): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'action_queued', {
    previousStatus: 'accepted',
    newStatus: 'queued',
    summary: `Action queued: ${execution.summary}`,
    actionExecutionId: execution.id,
    metadata: {
      actionType: execution.actionType,
      parameters: execution.parameters,
    },
  });
}

export function recordActionCompletedEvent(
  recommendationId: string,
  execution: ActionExecution
): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'action_completed', {
    previousStatus: 'queued',
    newStatus: 'completed',
    summary: `Action completed: ${execution.summary}`,
    actionExecutionId: execution.id,
    metadata: {
      result: execution.result,
    },
  });
}

export function recordActionFailedEvent(
  recommendationId: string,
  execution: ActionExecution,
  error: string
): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'action_failed', {
    previousStatus: 'queued',
    newStatus: 'open',
    summary: `Action failed: ${error}`,
    actionExecutionId: execution.id,
    metadata: {
      error,
    },
  });
}

export function recordOutcomeEvent(
  recommendationId: string,
  outcome: {
    value: number;
    summary: string;
    success: boolean;
  }
): RecommendationHistoryEvent {
  return createHistoryEvent(recommendationId, 'outcome_recorded', {
    previousStatus: 'completed',
    newStatus: 'completed',
    summary: outcome.summary,
    metadata: {
      outcomeValue: outcome.value,
      success: outcome.success,
    },
  });
}

// =============================================================================
// Query History
// =============================================================================

export function getRecommendationHistory(recommendationId: string): RecommendationHistoryEvent[] {
  return historyEvents
    .filter((e) => e.recommendationId === recommendationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getRecommendationTimeline(recommendationId: string): RecommendationTimeline {
  const events = getRecommendationHistory(recommendationId);
  const currentStatus = events.length > 0
    ? events[events.length - 1].newStatus || 'open'
    : 'open';

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const totalDuration = firstEvent && lastEvent
    ? new Date(lastEvent.createdAt).getTime() - new Date(firstEvent.createdAt).getTime()
    : undefined;

  const actionsExecuted = events.filter(
    (e) => e.eventType === 'action_queued' || e.eventType === 'action_completed'
  ).length;

  return {
    recommendationId,
    events,
    currentStatus,
    totalDuration,
    actionsExecuted,
  };
}

export function getAllHistory(): RecommendationHistoryEvent[] {
  return [...historyEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getRecentActivity(limit: number = 20): RecommendationHistoryEvent[] {
  return getAllHistory().slice(0, limit);
}

// =============================================================================
// Enhance Recommendation with Lifecycle Data
// =============================================================================

export function enhanceWithLifecycle(
  recommendation: Recommendation,
  executions: ActionExecution[] = []
): RecommendationWithLifecycle {
  const history = getRecommendationHistory(recommendation.id);
  const timeline = getRecommendationTimeline(recommendation.id);

  // Find relevant events
  const acceptedEvent = history.find((e) => e.eventType === 'accepted');
  const completedEvent = history.find((e) => e.eventType === 'action_completed');
  const lastActionEvent = history.filter(
    (e) => e.eventType === 'action_queued' || e.eventType === 'action_completed'
  ).pop();

  // Determine action taken
  let actionTaken: ActionType | undefined;
  if (lastActionEvent?.metadata?.actionType) {
    actionTaken = lastActionEvent.metadata.actionType as ActionType;
  }

  // Find outcome
  const outcomeEvent = history.find((e) => e.eventType === 'outcome_recorded');

  return {
    ...recommendation,
    lifecycleStatus: timeline.currentStatus,
    actedOnAt: acceptedEvent?.createdAt,
    closedAt: completedEvent?.createdAt,
    actionTaken,
    outcomeValue: outcomeEvent?.metadata?.outcomeValue as number | undefined,
    outcomeSummary: outcomeEvent?.summary,
    history,
  };
}

// =============================================================================
// Status Transitions
// =============================================================================

export const VALID_TRANSITIONS: Record<RecommendationLifecycleStatus, RecommendationLifecycleStatus[]> = {
  open: ['accepted', 'dismissed', 'monitoring'],
  accepted: ['queued', 'dismissed', 'open'],
  dismissed: ['open'],
  queued: ['completed', 'open'],
  completed: ['monitoring'],
  monitoring: ['open', 'completed'],
};

export function canTransitionTo(
  currentStatus: RecommendationLifecycleStatus,
  newStatus: RecommendationLifecycleStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

// =============================================================================
// Lifecycle Statistics
// =============================================================================

export interface LifecycleStats {
  total: number;
  byStatus: Record<RecommendationLifecycleStatus, number>;
  avgTimeToAction: number;
  avgTimeToCompletion: number;
  completionRate: number;
}

export function calculateLifecycleStats(recommendations: RecommendationWithLifecycle[]): LifecycleStats {
  const byStatus: Record<RecommendationLifecycleStatus, number> = {
    open: 0,
    accepted: 0,
    dismissed: 0,
    queued: 0,
    completed: 0,
    monitoring: 0,
  };

  let totalTimeToAction = 0;
  let actionCount = 0;
  let totalTimeToCompletion = 0;
  let completionCount = 0;

  for (const rec of recommendations) {
    byStatus[rec.lifecycleStatus] = (byStatus[rec.lifecycleStatus] || 0) + 1;

    if (rec.actedOnAt && rec.createdAt) {
      totalTimeToAction += new Date(rec.actedOnAt).getTime() - new Date(rec.createdAt).getTime();
      actionCount++;
    }

    if (rec.closedAt && rec.createdAt) {
      totalTimeToCompletion += new Date(rec.closedAt).getTime() - new Date(rec.createdAt).getTime();
      completionCount++;
    }
  }

  return {
    total: recommendations.length,
    byStatus,
    avgTimeToAction: actionCount > 0 ? totalTimeToAction / actionCount : 0,
    avgTimeToCompletion: completionCount > 0 ? totalTimeToCompletion / completionCount : 0,
    completionRate: recommendations.length > 0
      ? (byStatus.completed + byStatus.dismissed) / recommendations.length
      : 0,
  };
}

// =============================================================================
// Event Type Labels
// =============================================================================

export const EVENT_TYPE_LABELS: Record<RecommendationEventType, string> = {
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

export const STATUS_LABELS: Record<RecommendationLifecycleStatus, string> = {
  open: 'Open',
  accepted: 'Accepted',
  dismissed: 'Dismissed',
  queued: 'Queued',
  completed: 'Completed',
  monitoring: 'Monitoring',
};
