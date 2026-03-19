'use client';

import React, { useState } from 'react';
import {
  Package,
  Tag,
  Users,
  Eye,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Recommendation, ActionType, ActionParameters } from '@/lib/types';
import { ACTION_CONFIGS, getAvailableActions, getDefaultParameters } from '@/lib/services/action-execution';

// =============================================================================
// Icons mapping
// =============================================================================

const actionIcons: Record<string, React.ElementType> = {
  Package,
  Tag,
  Users,
  Eye,
  X,
};

// =============================================================================
// Types
// =============================================================================

interface ActionButtonsProps {
  recommendation: Recommendation;
  onExecute: (actionType: ActionType, parameters: ActionParameters) => Promise<void>;
  isLoading?: boolean;
  variant?: 'full' | 'compact' | 'dropdown';
}

// =============================================================================
// Primary Action Button
// =============================================================================

function getPrimaryAction(recommendation: Recommendation): {
  type: ActionType;
  label: string;
  icon: React.ElementType;
} | null {
  switch (recommendation.type) {
    case 'stockout_risk':
    case 'reorder_suggestion':
      return {
        type: 'reorder_inventory',
        label: 'Reorder',
        icon: Package,
      };
    case 'slow_mover':
    case 'promotion_opportunity':
    case 'pricing_adjustment':
      return {
        type: 'launch_promotion',
        label: 'Launch Promo',
        icon: Tag,
      };
    case 'customer_retention':
      return {
        type: 'queue_retention_campaign',
        label: 'Send Campaign',
        icon: Users,
      };
    case 'bundle_opportunity':
      return {
        type: 'mark_for_review',
        label: 'Review',
        icon: Eye,
      };
    default:
      return null;
  }
}

// =============================================================================
// Action Buttons Component
// =============================================================================

export function ActionButtons({
  recommendation,
  onExecute,
  isLoading = false,
  variant = 'full',
}: ActionButtonsProps) {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);
  const availableActions = getAvailableActions(recommendation);
  const primaryAction = getPrimaryAction(recommendation);

  const handleExecute = async (actionType: ActionType) => {
    if (isLoading || loadingAction) return;

    setLoadingAction(actionType);
    try {
      const defaultParams = getDefaultParameters(actionType, recommendation);
      await onExecute(actionType, defaultParams);
    } finally {
      setLoadingAction(null);
    }
  };

  // Don't show actions for non-pending recommendations
  if (recommendation.status !== 'pending') {
    return null;
  }

  // Compact variant - just buttons
  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        {primaryAction && (
          <Button
            size="sm"
            onClick={() => handleExecute(primaryAction.type)}
            disabled={isLoading || !!loadingAction}
          >
            {loadingAction === primaryAction.type ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <primaryAction.icon className="h-4 w-4 mr-1" />
            )}
            {primaryAction.label}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExecute('dismiss_recommendation')}
          disabled={isLoading || !!loadingAction}
        >
          {loadingAction === 'dismiss_recommendation' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading || !!loadingAction}>
            {loadingAction ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Actions
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {availableActions.map((action) => {
            const Icon = actionIcons[action.icon] || Package;
            return (
              <DropdownMenuItem
                key={action.type}
                onClick={() => handleExecute(action.type)}
                disabled={loadingAction === action.type}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant - all buttons displayed
  return (
    <div className="flex flex-col gap-3">
      {/* Primary Actions */}
      <div className="flex gap-3">
        {primaryAction && (
          <Button
            className="flex-1"
            onClick={() => handleExecute(primaryAction.type)}
            disabled={isLoading || !!loadingAction}
          >
            {loadingAction === primaryAction.type ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <primaryAction.icon className="h-4 w-4 mr-2" />
            )}
            {primaryAction.label}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => handleExecute('mark_for_review')}
          disabled={isLoading || !!loadingAction}
        >
          {loadingAction === 'mark_for_review' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Review
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExecute('dismiss_recommendation')}
          disabled={isLoading || !!loadingAction}
        >
          {loadingAction === 'dismiss_recommendation' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Dismiss
        </Button>
      </div>

      {/* Secondary Actions */}
      {availableActions.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {availableActions
            .filter((a) => a.type !== primaryAction?.type && a.type !== 'mark_for_review' && a.type !== 'dismiss_recommendation')
            .map((action) => {
              const Icon = actionIcons[action.icon] || Package;
              return (
                <Button
                  key={action.type}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExecute(action.type)}
                  disabled={isLoading || !!loadingAction}
                >
                  {loadingAction === action.type ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Icon className="h-4 w-4 mr-1" />
                  )}
                  {action.label}
                </Button>
              );
            })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Quick Action Button (Single)
// =============================================================================

interface QuickActionButtonProps {
  recommendation: Recommendation;
  onExecute: (actionType: ActionType, parameters: ActionParameters) => Promise<void>;
  isLoading?: boolean;
}

export function QuickActionButton({
  recommendation,
  onExecute,
  isLoading = false,
}: QuickActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const primaryAction = getPrimaryAction(recommendation);

  if (!primaryAction || recommendation.status !== 'pending') {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || loading) return;

    setLoading(true);
    try {
      const defaultParams = getDefaultParameters(primaryAction.type, recommendation);
      await onExecute(primaryAction.type, defaultParams);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={isLoading || loading}
      className="whitespace-nowrap"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
      ) : (
        <primaryAction.icon className="h-3.5 w-3.5 mr-1" />
      )}
      {primaryAction.label}
    </Button>
  );
}
