// =============================================================================
// Action Execution Service
// =============================================================================
// Handles executing actions on recommendations with simulated results for demo mode
// =============================================================================

import type {
  ActionType,
  ActionStatus,
  ActionParameters,
  ActionResult,
  ActionExecution,
  ActionExecuteRequest,
  ActionExecuteResponse,
  Recommendation,
  RecommendationLifecycleStatus,
} from '@/lib/types';

// =============================================================================
// Action Configuration
// =============================================================================

export interface ActionConfig {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  applicableTypes: string[];
  requiredParams: string[];
  optionalParams: string[];
}

export const ACTION_CONFIGS: Record<ActionType, ActionConfig> = {
  reorder_inventory: {
    type: 'reorder_inventory',
    label: 'Reorder Inventory',
    description: 'Place an inventory reorder with your supplier',
    icon: 'Package',
    applicableTypes: ['stockout_risk', 'reorder_suggestion'],
    requiredParams: ['sku', 'quantity'],
    optionalParams: ['expedite'],
  },
  launch_promotion: {
    type: 'launch_promotion',
    label: 'Launch Promotion',
    description: 'Create and schedule a promotional campaign',
    icon: 'Tag',
    applicableTypes: ['slow_mover', 'promotion_opportunity', 'pricing_adjustment'],
    requiredParams: ['sku', 'discountPercent'],
    optionalParams: ['durationDays'],
  },
  queue_retention_campaign: {
    type: 'queue_retention_campaign',
    label: 'Queue Retention Campaign',
    description: 'Schedule an email campaign to re-engage customers',
    icon: 'Users',
    applicableTypes: ['customer_retention'],
    requiredParams: ['segmentId', 'campaignName'],
    optionalParams: ['notes'],
  },
  mark_for_review: {
    type: 'mark_for_review',
    label: 'Mark for Review',
    description: 'Flag this recommendation for manual review',
    icon: 'Eye',
    applicableTypes: ['stockout_risk', 'slow_mover', 'promotion_opportunity', 'pricing_adjustment', 'customer_retention', 'bundle_opportunity', 'reorder_suggestion'],
    requiredParams: [],
    optionalParams: ['notes'],
  },
  dismiss_recommendation: {
    type: 'dismiss_recommendation',
    label: 'Dismiss',
    description: 'Dismiss this recommendation',
    icon: 'X',
    applicableTypes: ['stockout_risk', 'slow_mover', 'promotion_opportunity', 'pricing_adjustment', 'customer_retention', 'bundle_opportunity', 'reorder_suggestion'],
    requiredParams: [],
    optionalParams: ['notes'],
  },
};

// =============================================================================
// In-Memory Storage for Demo Mode
// =============================================================================

let actionExecutions: ActionExecution[] = [];
let executionIdCounter = 1;

export function resetActionExecutions(): void {
  actionExecutions = [];
  executionIdCounter = 1;
}

export function getActionExecutions(): ActionExecution[] {
  return [...actionExecutions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getActionExecutionsByRecommendation(recommendationId: string): ActionExecution[] {
  return actionExecutions
    .filter((a) => a.recommendationId === recommendationId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// =============================================================================
// Action Simulation Logic
// =============================================================================

function generateExecutionId(): string {
  return `exec_${String(executionIdCounter++).padStart(3, '0')}`;
}

function simulateReorderInventory(
  params: ActionParameters,
  recommendation: Recommendation
): ActionResult {
  const quantity = params.quantity || 100;
  const expedite = params.expedite || false;
  const currentVelocity = 18; // units per day (from demo data)
  const estimatedCoverageDays = quantity / currentVelocity;
  const shippingCost = expedite ? 800 : 150;

  return {
    success: true,
    message: expedite
      ? `Expedited reorder of ${quantity} units placed successfully`
      : `Standard reorder of ${quantity} units placed successfully`,
    data: {
      sku: params.sku || recommendation.entity,
      quantity,
      estimatedInventoryCoverageDays: Math.round(estimatedCoverageDays * 10) / 10,
      shippingCost,
      estimatedArrival: expedite ? '3 business days' : '7 business days',
      orderNumber: `PO-${Date.now().toString(36).toUpperCase()}`,
    },
  };
}

function simulateLaunchPromotion(
  params: ActionParameters,
  recommendation: Recommendation
): ActionResult {
  const discountPercent = params.discountPercent || 15;
  const durationDays = params.durationDays || 7;
  const baseUnits = 89; // from demo data (Pork Sampler inventory)
  const elasticity = 1.6;
  const projectedUnitsSold = Math.round(baseUnits * 0.6 * (1 + (discountPercent / 100) * elasticity));
  const unitPrice = 36; // Pork Sampler price
  const projectedRevenue = projectedUnitsSold * unitPrice * (1 - discountPercent / 100);

  return {
    success: true,
    message: `${discountPercent}% promotion scheduled for ${durationDays} days`,
    data: {
      sku: params.sku || recommendation.entity,
      discountPercent,
      durationDays,
      promotionId: `PROMO-${Date.now().toString(36).toUpperCase()}`,
      projectedUnits: projectedUnitsSold,
      projectedRevenue: Math.round(projectedRevenue),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}

function simulateRetentionCampaign(
  params: ActionParameters,
  recommendation: Recommendation
): ActionResult {
  const segmentSize = 847; // March cohort size from demo data
  const expectedOpenRate = 0.32;
  const expectedConversionRate = 0.15;
  const aov = 89;
  const projectedConversions = Math.round(segmentSize * expectedOpenRate * expectedConversionRate);
  const projectedRevenue = projectedConversions * aov;

  return {
    success: true,
    message: `Win-back campaign "${params.campaignName}" queued for delivery`,
    data: {
      campaignId: `CAMP-${Date.now().toString(36).toUpperCase()}`,
      campaignName: params.campaignName,
      segmentId: params.segmentId || 'march-2024-cohort',
      segmentSize,
      expectedOpenRate: Math.round(expectedOpenRate * 100),
      projectedConversions,
      projectedRevenue,
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

function simulateMarkForReview(
  params: ActionParameters,
  recommendation: Recommendation
): ActionResult {
  return {
    success: true,
    message: 'Recommendation marked for manual review',
    data: {
      reviewId: `REV-${Date.now().toString(36).toUpperCase()}`,
      notes: params.notes || 'Flagged for further investigation',
      assignedTo: 'Operations Team',
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}

function simulateDismissRecommendation(
  params: ActionParameters,
  recommendation: Recommendation
): ActionResult {
  return {
    success: true,
    message: 'Recommendation dismissed',
    data: {
      reason: params.notes || 'User dismissed',
      dismissedAt: new Date().toISOString(),
    },
  };
}

// =============================================================================
// Execute Action
// =============================================================================

export async function executeAction(
  request: ActionExecuteRequest,
  recommendation: Recommendation
): Promise<ActionExecuteResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  const executionId = generateExecutionId();
  const now = new Date().toISOString();

  // Determine result based on action type
  let result: ActionResult;
  let summary: string;

  switch (request.actionType) {
    case 'reorder_inventory':
      result = simulateReorderInventory(request.parameters, recommendation);
      summary = `Reorder request created for ${request.parameters.quantity || 100} units of ${recommendation.entity}`;
      break;

    case 'launch_promotion':
      result = simulateLaunchPromotion(request.parameters, recommendation);
      summary = `${request.parameters.discountPercent || 15}% promotion scheduled for ${recommendation.entity}`;
      break;

    case 'queue_retention_campaign':
      result = simulateRetentionCampaign(request.parameters, recommendation);
      summary = `Win-back campaign queued for ${recommendation.entity}`;
      break;

    case 'mark_for_review':
      result = simulateMarkForReview(request.parameters, recommendation);
      summary = `${recommendation.title} marked for manual review`;
      break;

    case 'dismiss_recommendation':
      result = simulateDismissRecommendation(request.parameters, recommendation);
      summary = `${recommendation.title} dismissed`;
      break;

    default:
      throw new Error(`Unknown action type: ${request.actionType}`);
  }

  // Determine status based on action type
  const status: ActionStatus =
    request.actionType === 'dismiss_recommendation' || request.actionType === 'mark_for_review'
      ? 'completed'
      : 'queued';

  // Create execution record
  const execution: ActionExecution = {
    id: executionId,
    recommendationId: request.recommendationId,
    actionType: request.actionType,
    parameters: request.parameters,
    status,
    result,
    createdAt: now,
    completedAt: status === 'completed' ? now : undefined,
    summary,
  };

  // Store execution
  actionExecutions.push(execution);

  // Determine new recommendation status
  let newRecommendationStatus: RecommendationLifecycleStatus;
  switch (request.actionType) {
    case 'dismiss_recommendation':
      newRecommendationStatus = 'dismissed';
      break;
    case 'mark_for_review':
      newRecommendationStatus = 'monitoring';
      break;
    default:
      newRecommendationStatus = 'queued';
  }

  // Update recommendation (simulated)
  const updatedRecommendation: Recommendation = {
    ...recommendation,
    status: request.actionType === 'dismiss_recommendation' ? 'dismissed' : 'accepted',
    updatedAt: now,
  };

  return {
    execution,
    recommendation: updatedRecommendation,
  };
}

// =============================================================================
// Get Available Actions for Recommendation
// =============================================================================

export function getAvailableActions(recommendation: Recommendation): ActionConfig[] {
  return Object.values(ACTION_CONFIGS).filter((config) =>
    config.applicableTypes.includes(recommendation.type)
  );
}

// =============================================================================
// Validate Action Parameters
// =============================================================================

export function validateActionParameters(
  actionType: ActionType,
  parameters: ActionParameters
): { valid: boolean; errors: string[] } {
  const config = ACTION_CONFIGS[actionType];
  if (!config) {
    return { valid: false, errors: [`Unknown action type: ${actionType}`] };
  }

  const errors: string[] = [];

  for (const param of config.requiredParams) {
    if (parameters[param] === undefined || parameters[param] === null || parameters[param] === '') {
      errors.push(`Missing required parameter: ${param}`);
    }
  }

  // Type-specific validation
  if (actionType === 'reorder_inventory') {
    if (parameters.quantity && (parameters.quantity < 1 || parameters.quantity > 10000)) {
      errors.push('Quantity must be between 1 and 10,000');
    }
  }

  if (actionType === 'launch_promotion') {
    if (parameters.discountPercent && (parameters.discountPercent < 1 || parameters.discountPercent > 90)) {
      errors.push('Discount must be between 1% and 90%');
    }
    if (parameters.durationDays && (parameters.durationDays < 1 || parameters.durationDays > 30)) {
      errors.push('Duration must be between 1 and 30 days');
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// Get Default Parameters for Action
// =============================================================================

export function getDefaultParameters(
  actionType: ActionType,
  recommendation: Recommendation
): ActionParameters {
  switch (actionType) {
    case 'reorder_inventory':
      return {
        sku: recommendation.entity,
        quantity: 150,
        expedite: recommendation.urgency === 'immediate',
      };

    case 'launch_promotion':
      return {
        sku: recommendation.entity,
        discountPercent: 15,
        durationDays: 7,
      };

    case 'queue_retention_campaign':
      return {
        segmentId: recommendation.entity.toLowerCase().replace(/\s+/g, '-'),
        campaignName: `Win-Back: ${recommendation.entity}`,
      };

    case 'mark_for_review':
      return {
        notes: '',
      };

    case 'dismiss_recommendation':
      return {
        notes: '',
      };

    default:
      return {};
  }
}
