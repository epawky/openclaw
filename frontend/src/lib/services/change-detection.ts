// =============================================================================
// Change Detection Engine
// =============================================================================
// Identifies and tracks meaningful changes in store performance metrics
// Uses deterministic rules with configurable thresholds
// =============================================================================

import type {
  ChangeType,
  ChangeEntityType,
  ChangeSignificance,
  ChangeDirection,
  ChangeEvent,
  ChangeSummary,
  ChangeDetectionConfig,
  KPIData,
  InventoryAnalysis,
  CustomerAnalysis,
} from '@/lib/types';

// =============================================================================
// Configuration
// =============================================================================

export const DEFAULT_CHANGE_CONFIG: ChangeDetectionConfig = {
  minPercentChange: 5, // 5% minimum change to flag
  minRevenueThreshold: 100, // $100 minimum revenue impact
  minUnitsThreshold: 5, // 5 units minimum change
  significanceBands: {
    critical: 20, // >20% change is critical
    high: 10, // >10% change is high
    medium: 5, // >5% change is medium
  },
};

let changeConfig = { ...DEFAULT_CHANGE_CONFIG };

export function setChangeDetectionConfig(config: Partial<ChangeDetectionConfig>): void {
  changeConfig = { ...changeConfig, ...config };
}

export function getChangeDetectionConfig(): ChangeDetectionConfig {
  return { ...changeConfig };
}

// =============================================================================
// In-Memory Storage for Demo Mode
// =============================================================================

let changeEvents: ChangeEvent[] = [];
let changeIdCounter = 1;

export function resetChangeEvents(): void {
  changeEvents = [];
  changeIdCounter = 1;
}

function generateChangeId(): string {
  return `chg_${String(changeIdCounter++).padStart(4, '0')}`;
}

// =============================================================================
// Change Detection Logic
// =============================================================================

function calculatePercentChange(current: number, prior: number): number {
  if (prior === 0) return current > 0 ? 100 : 0;
  return ((current - prior) / Math.abs(prior)) * 100;
}

function determineSignificance(percentChange: number): ChangeSignificance {
  const absChange = Math.abs(percentChange);
  if (absChange >= changeConfig.significanceBands.critical) return 'critical';
  if (absChange >= changeConfig.significanceBands.high) return 'high';
  if (absChange >= changeConfig.significanceBands.medium) return 'medium';
  return 'low';
}

function determineDirection(percentChange: number, isPositiveGood: boolean): ChangeDirection {
  if (Math.abs(percentChange) < changeConfig.minPercentChange) return 'neutral';
  const isPositive = percentChange > 0;
  if (isPositiveGood) {
    return isPositive ? 'positive' : 'negative';
  }
  return isPositive ? 'negative' : 'positive';
}

function shouldFlag(percentChange: number, absoluteChange: number, isRevenue: boolean): boolean {
  const absPercent = Math.abs(percentChange);
  if (absPercent < changeConfig.minPercentChange) return false;
  if (isRevenue && Math.abs(absoluteChange) < changeConfig.minRevenueThreshold) return false;
  return true;
}

// =============================================================================
// Create Change Event
// =============================================================================

function createChangeEvent(params: {
  changeType: ChangeType;
  entityType: ChangeEntityType;
  entityId: string;
  entityName?: string;
  metricName: string;
  currentValue: number;
  priorValue: number;
  isPositiveGood?: boolean;
  evidence?: { description: string; data?: Record<string, unknown> }[];
  relatedRecommendationIds?: string[];
}): ChangeEvent | null {
  const absoluteChange = params.currentValue - params.priorValue;
  const percentChange = calculatePercentChange(params.currentValue, params.priorValue);
  const isPositiveGood = params.isPositiveGood !== false;

  // Check if change meets threshold
  const isRevenue = params.metricName.toLowerCase().includes('revenue');
  if (!shouldFlag(percentChange, absoluteChange, isRevenue)) {
    return null;
  }

  const event: ChangeEvent = {
    id: generateChangeId(),
    changeDate: new Date().toISOString().split('T')[0],
    changeType: params.changeType,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    metricName: params.metricName,
    currentValue: params.currentValue,
    priorValue: params.priorValue,
    absoluteChange: Math.round(absoluteChange * 100) / 100,
    percentChange: Math.round(percentChange * 10) / 10,
    significance: determineSignificance(percentChange),
    direction: determineDirection(percentChange, isPositiveGood),
    evidence: params.evidence,
    relatedRecommendationIds: params.relatedRecommendationIds,
    detectedAt: new Date().toISOString(),
  };

  changeEvents.push(event);
  return event;
}

// =============================================================================
// Detect KPI Changes
// =============================================================================

export function detectKPIChanges(kpis: KPIData): ChangeEvent[] {
  const detectedChanges: ChangeEvent[] = [];

  // Revenue change
  const revenueChange = createChangeEvent({
    changeType: kpis.revenue.current > kpis.revenue.previous ? 'revenue_up' : 'revenue_down',
    entityType: 'store',
    entityId: 'store-main',
    metricName: 'Weekly Revenue',
    currentValue: kpis.revenue.current,
    priorValue: kpis.revenue.previous,
    evidence: [
      {
        description: `Revenue changed from $${kpis.revenue.previous.toLocaleString()} to $${kpis.revenue.current.toLocaleString()}`,
      },
    ],
  });
  if (revenueChange) detectedChanges.push(revenueChange);

  // Orders change
  const ordersChange = createChangeEvent({
    changeType: kpis.orders.current > kpis.orders.previous ? 'orders_up' : 'orders_down',
    entityType: 'store',
    entityId: 'store-main',
    metricName: 'Weekly Orders',
    currentValue: kpis.orders.current,
    priorValue: kpis.orders.previous,
    evidence: [
      {
        description: `Orders changed from ${kpis.orders.previous} to ${kpis.orders.current}`,
      },
    ],
  });
  if (ordersChange) detectedChanges.push(ordersChange);

  // AOV change
  const aovChange = createChangeEvent({
    changeType: kpis.aov.current > kpis.aov.previous ? 'aov_up' : 'aov_down',
    entityType: 'store',
    entityId: 'store-main',
    metricName: 'Average Order Value',
    currentValue: kpis.aov.current,
    priorValue: kpis.aov.previous,
    evidence: [
      {
        description: `AOV changed from $${kpis.aov.previous.toFixed(2)} to $${kpis.aov.current.toFixed(2)}`,
      },
    ],
  });
  if (aovChange) detectedChanges.push(aovChange);

  // Returning customer rate change
  const repeatChange = createChangeEvent({
    changeType: kpis.returningCustomerRate.current > kpis.returningCustomerRate.previous
      ? 'repeat_rate_up'
      : 'repeat_rate_down',
    entityType: 'store',
    entityId: 'store-main',
    metricName: 'Returning Customer Rate',
    currentValue: kpis.returningCustomerRate.current,
    priorValue: kpis.returningCustomerRate.previous,
    evidence: [
      {
        description: `Returning rate changed from ${kpis.returningCustomerRate.previous}% to ${kpis.returningCustomerRate.current}%`,
      },
    ],
  });
  if (repeatChange) detectedChanges.push(repeatChange);

  return detectedChanges;
}

// =============================================================================
// Detect Inventory Changes
// =============================================================================

export function detectInventoryChanges(
  inventory: InventoryAnalysis,
  previousInventory?: InventoryAnalysis
): ChangeEvent[] {
  const detectedChanges: ChangeEvent[] = [];

  // Critical stockout risks
  for (const sku of inventory.stockoutRisks) {
    if (sku.riskClass === 'critical') {
      const change = createChangeEvent({
        changeType: 'new_stockout_risk',
        entityType: 'sku',
        entityId: sku.sku,
        entityName: sku.productName,
        metricName: 'Days Remaining',
        currentValue: sku.daysRemaining,
        priorValue: 14, // Assume 14 days was healthy
        isPositiveGood: true, // More days is better
        evidence: [
          { description: `Only ${sku.daysRemaining} days of inventory remaining` },
          { description: `$${sku.estimatedRevenueAtRisk.toLocaleString()} revenue at risk` },
          { description: `Velocity: ${Math.round(sku.velocity7Day / 7)} units/day` },
        ],
        relatedRecommendationIds: ['rec-reorder-brisket'],
      });
      if (change) detectedChanges.push(change);
    }
  }

  // Slow movers
  for (const slowMover of inventory.slowMovers) {
    if (slowMover.inventoryDays > 30) {
      const change = createChangeEvent({
        changeType: 'slow_mover_worsened',
        entityType: 'sku',
        entityId: slowMover.sku,
        entityName: slowMover.productName,
        metricName: 'Days of Inventory',
        currentValue: slowMover.inventoryDays,
        priorValue: 21, // Assume 21 days was the prior state
        isPositiveGood: false, // Fewer days is better for slow movers
        evidence: [
          { description: `${slowMover.inventoryDays} days of inventory on hand` },
          { description: `Only ${slowMover.unitsSold30Day} units sold in 30 days` },
          { description: `$${slowMover.revenue30Day.toLocaleString()} in 30-day revenue` },
        ],
        relatedRecommendationIds: ['rec-discount-pork'],
      });
      if (change) detectedChanges.push(change);
    }
  }

  return detectedChanges;
}

// =============================================================================
// Detect Customer Changes
// =============================================================================

export function detectCustomerChanges(customers: CustomerAnalysis): ChangeEvent[] {
  const detectedChanges: ChangeEvent[] = [];

  // Check cohort retention
  const benchmark = 32; // 32% retention benchmark
  for (const cohort of customers.cohortRetention) {
    // Check month 3 retention as key indicator
    if (cohort.month3 < benchmark * 0.7) {
      // If below 70% of benchmark
      const change = createChangeEvent({
        changeType: 'cohort_retention_dropped',
        entityType: 'cohort',
        entityId: cohort.cohort.toLowerCase().replace(/\s+/g, '-'),
        entityName: cohort.cohort,
        metricName: 'Month 3 Retention',
        currentValue: cohort.month3,
        priorValue: benchmark,
        isPositiveGood: true, // Higher retention is better
        evidence: [
          { description: `${cohort.cohort} cohort at ${cohort.month3}% retention vs ${benchmark}% benchmark` },
          { description: `Started at ${cohort.month0} customers` },
          { description: `Month-over-month trend: ${cohort.month1}% → ${cohort.month2}% → ${cohort.month3}%` },
        ],
        relatedRecommendationIds: ['rec-retention-march'],
      });
      if (change) detectedChanges.push(change);
    }
  }

  // Returning customer rate change
  if (customers.metrics.returningCustomerRate < 30) {
    const change = createChangeEvent({
      changeType: 'repeat_rate_down',
      entityType: 'store',
      entityId: 'store-main',
      metricName: 'Returning Customer Rate',
      currentValue: customers.metrics.returningCustomerRate,
      priorValue: 30, // Assume 30% was prior
      evidence: [
        { description: `Returning customer rate at ${customers.metrics.returningCustomerRate}%` },
        { description: `${customers.metrics.newCustomers30Day} new vs ${customers.metrics.returningCustomers30Day} returning in 30 days` },
      ],
    });
    if (change) detectedChanges.push(change);
  }

  return detectedChanges;
}

// =============================================================================
// Get Changes Summary
// =============================================================================

export function getChangeSummary(
  period?: { start: string; end: string }
): ChangeSummary {
  const now = new Date();
  const startDate = period?.start || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = period?.end || now.toISOString().split('T')[0];

  // Filter by period
  const relevantChanges = changeEvents.filter((e) => {
    return e.changeDate >= startDate && e.changeDate <= endDate;
  });

  // Separate by direction
  const positiveChanges = relevantChanges.filter((e) => e.direction === 'positive');
  const negativeChanges = relevantChanges.filter((e) => e.direction === 'negative');

  // Group by category
  const byCategory = {
    revenue: relevantChanges.filter((e) =>
      ['revenue_up', 'revenue_down', 'orders_up', 'orders_down', 'aov_up', 'aov_down'].includes(e.changeType)
    ),
    inventory: relevantChanges.filter((e) =>
      ['stockout_risk_increased', 'stockout_risk_decreased', 'slow_mover_worsened', 'slow_mover_improved', 'new_stockout_risk', 'stockout_resolved', 'sku_demand_up', 'sku_demand_down'].includes(e.changeType)
    ),
    customers: relevantChanges.filter((e) =>
      ['repeat_rate_up', 'repeat_rate_down', 'cohort_retention_dropped', 'cohort_retention_improved'].includes(e.changeType)
    ),
    operations: relevantChanges.filter((e) =>
      ['promotion_candidate_improved'].includes(e.changeType)
    ),
  };

  const criticalChanges = relevantChanges.filter((e) => e.significance === 'critical').length;

  return {
    period: { start: startDate, end: endDate },
    totalChanges: relevantChanges.length,
    criticalChanges,
    positiveChanges: positiveChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)),
    negativeChanges: negativeChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)),
    byCategory,
  };
}

// =============================================================================
// Get Latest Changes
// =============================================================================

export function getLatestChanges(limit: number = 10): ChangeEvent[] {
  return [...changeEvents]
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .slice(0, limit);
}

export function getChangesByEntity(entityId: string): ChangeEvent[] {
  return changeEvents
    .filter((e) => e.entityId === entityId)
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}

export function getChangesByType(changeType: ChangeType): ChangeEvent[] {
  return changeEvents
    .filter((e) => e.changeType === changeType)
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}

export function getCriticalChanges(): ChangeEvent[] {
  return changeEvents
    .filter((e) => e.significance === 'critical')
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}

// =============================================================================
// Run Full Detection
// =============================================================================

export function runChangeDetection(
  kpis: KPIData,
  inventory: InventoryAnalysis,
  customers: CustomerAnalysis
): ChangeSummary {
  // Clear previous changes for fresh detection
  resetChangeEvents();

  // Run all detectors
  detectKPIChanges(kpis);
  detectInventoryChanges(inventory);
  detectCustomerChanges(customers);

  // Return summary
  return getChangeSummary();
}

// =============================================================================
// Change Type Labels and Icons
// =============================================================================

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  revenue_up: 'Revenue Increased',
  revenue_down: 'Revenue Decreased',
  orders_up: 'Orders Increased',
  orders_down: 'Orders Decreased',
  aov_up: 'AOV Increased',
  aov_down: 'AOV Decreased',
  repeat_rate_up: 'Repeat Rate Improved',
  repeat_rate_down: 'Repeat Rate Dropped',
  sku_demand_up: 'SKU Demand Increased',
  sku_demand_down: 'SKU Demand Decreased',
  stockout_risk_increased: 'Stockout Risk Increased',
  stockout_risk_decreased: 'Stockout Risk Decreased',
  slow_mover_worsened: 'Slow Mover Worsened',
  slow_mover_improved: 'Slow Mover Improved',
  promotion_candidate_improved: 'Promotion Opportunity',
  cohort_retention_dropped: 'Cohort Retention Dropped',
  cohort_retention_improved: 'Cohort Retention Improved',
  new_stockout_risk: 'New Stockout Risk',
  stockout_resolved: 'Stockout Resolved',
};

export const CHANGE_CATEGORY_MAP: Record<ChangeType, string> = {
  revenue_up: 'Revenue',
  revenue_down: 'Revenue',
  orders_up: 'Revenue',
  orders_down: 'Revenue',
  aov_up: 'Revenue',
  aov_down: 'Revenue',
  repeat_rate_up: 'Customers',
  repeat_rate_down: 'Customers',
  sku_demand_up: 'Inventory',
  sku_demand_down: 'Inventory',
  stockout_risk_increased: 'Inventory',
  stockout_risk_decreased: 'Inventory',
  slow_mover_worsened: 'Inventory',
  slow_mover_improved: 'Inventory',
  promotion_candidate_improved: 'Operations',
  cohort_retention_dropped: 'Customers',
  cohort_retention_improved: 'Customers',
  new_stockout_risk: 'Inventory',
  stockout_resolved: 'Inventory',
};
