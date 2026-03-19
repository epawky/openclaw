'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Package,
  Tag,
  Users,
  Eye,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActionExecution, ActionType } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface ActionResultToastProps {
  execution: ActionExecution;
  onClose: () => void;
  onViewDetails?: () => void;
  autoHideDuration?: number;
}

// =============================================================================
// Icons mapping
// =============================================================================

const actionIcons: Record<ActionType, React.ElementType> = {
  reorder_inventory: Package,
  launch_promotion: Tag,
  queue_retention_campaign: Users,
  mark_for_review: Eye,
  dismiss_recommendation: X,
};

// =============================================================================
// Action Result Toast Component
// =============================================================================

export function ActionResultToast({
  execution,
  onClose,
  onViewDetails,
  autoHideDuration = 5000,
}: ActionResultToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = actionIcons[execution.actionType];
  const isSuccess = execution.result?.success !== false;

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-right-5 fade-in duration-300',
        isExiting && 'animate-out slide-out-to-right-5 fade-out duration-300'
      )}
    >
      <div
        className={cn(
          'rounded-lg border p-4 shadow-elevated bg-white',
          isSuccess ? 'border-green-200' : 'border-red-200'
        )}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-900">
                  {isSuccess ? 'Action Completed' : 'Action Failed'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-sm text-slate-600">{execution.summary}</p>

            {/* Result Data */}
            {execution.result?.data && (
              <div className="mt-2 rounded bg-slate-50 p-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {execution.result.data.quantity != null && (
                    <span>Quantity: {String(execution.result.data.quantity)}</span>
                  )}
                  {execution.result.data.estimatedInventoryCoverageDays != null && (
                    <span>
                      Coverage: {String(execution.result.data.estimatedInventoryCoverageDays)} days
                    </span>
                  )}
                  {execution.result.data.projectedRevenue != null && (
                    <span>
                      Est. Revenue: ${Number(execution.result.data.projectedRevenue).toLocaleString()}
                    </span>
                  )}
                  {execution.result.data.discountPercent != null && (
                    <span>Discount: {String(execution.result.data.discountPercent)}%</span>
                  )}
                  {execution.result.data.durationDays != null && (
                    <span>Duration: {String(execution.result.data.durationDays)} days</span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              {onViewDetails && (
                <Button size="sm" variant="outline" onClick={onViewDetails}>
                  View Details
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar for auto-hide */}
        {autoHideDuration > 0 && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                'h-full rounded-full animate-shrink-width',
                isSuccess ? 'bg-green-500' : 'bg-red-500'
              )}
              style={{
                animationDuration: `${autoHideDuration}ms`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Action Result Toast Container (for multiple toasts)
// =============================================================================

interface ActionResultToastContainerProps {
  executions: ActionExecution[];
  onDismiss: (executionId: string) => void;
}

export function ActionResultToastContainer({
  executions,
  onDismiss,
}: ActionResultToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {executions.map((execution) => (
        <ActionResultToast
          key={execution.id}
          execution={execution}
          onClose={() => onDismiss(execution.id)}
        />
      ))}
    </div>
  );
}
