import type {
  ApiResponse,
  AskRequest,
  AskResponse,
  CustomerAnalysis,
  DailyAnalysis,
  InventoryAnalysis,
  KPIData,
  OperatingBrief,
  Opportunity,
  Recommendation,
  RootCause,
  SimulationInput,
  SimulationResult,
  TrendDataPoint,
  ActionExecuteRequest,
  ActionExecuteResponse,
  ActionExecution,
  RecommendationTimeline,
  ChangeSummary,
  ChangeEvent,
} from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const USE_DEMO_DATA = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Helper to determine which data source to use
const shouldUseMockData = () => USE_MOCK_DATA || USE_DEMO_DATA;

// All mock/demo data now comes from the demo data module (Prairie Prime Meats)
const getDemoData = () => import('@/lib/demo/data');

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.code || 'UNKNOWN_ERROR',
      error.message || 'An error occurred',
      error.details
    );
  }

  return response.json();
}

// =============================================================================
// Brief API
// =============================================================================

export async function getBriefToday(): Promise<ApiResponse<OperatingBrief>> {
  if (shouldUseMockData()) {
    const { demoBrief } = await getDemoData();
    return { data: demoBrief };
  }
  return fetchApi<ApiResponse<OperatingBrief>>('/brief/today');
}

// =============================================================================
// Recommendations API
// =============================================================================

export async function getRecommendations(params?: {
  status?: string[];
  type?: string[];
  priority?: string[];
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<Recommendation[]>> {
  if (shouldUseMockData()) {
    const { demoRecommendations } = await getDemoData();
    let filtered = [...demoRecommendations];

    if (params?.status?.length) {
      filtered = filtered.filter((r) => params.status!.includes(r.status));
    }
    if (params?.type?.length) {
      filtered = filtered.filter((r) => params.type!.includes(r.type));
    }
    if (params?.priority?.length) {
      filtered = filtered.filter((r) => params.priority!.includes(r.priority));
    }

    return { data: filtered };
  }

  const searchParams = new URLSearchParams();
  if (params?.status) params.status.forEach((s) => searchParams.append('status', s));
  if (params?.type) params.type.forEach((t) => searchParams.append('type', t));
  if (params?.priority) params.priority.forEach((p) => searchParams.append('priority', p));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  return fetchApi<ApiResponse<Recommendation[]>>(
    `/recommendations${query ? `?${query}` : ''}`
  );
}

export async function getRecommendation(id: string): Promise<ApiResponse<Recommendation>> {
  if (shouldUseMockData()) {
    const { demoRecommendations } = await getDemoData();
    const rec = demoRecommendations.find((r) => r.id === id);
    if (!rec) throw new ApiError(404, 'NOT_FOUND', 'Recommendation not found');
    return { data: rec };
  }
  return fetchApi<ApiResponse<Recommendation>>(`/recommendations/${id}`);
}

export async function updateRecommendationStatus(
  id: string,
  status: 'accepted' | 'dismissed'
): Promise<ApiResponse<Recommendation>> {
  if (shouldUseMockData()) {
    const { demoRecommendations } = await getDemoData();
    const rec = demoRecommendations.find((r) => r.id === id);
    if (!rec) throw new ApiError(404, 'NOT_FOUND', 'Recommendation not found');
    return { data: { ...rec, status } };
  }
  return fetchApi<ApiResponse<Recommendation>>(`/recommendations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// =============================================================================
// Analysis API
// =============================================================================

export async function getKPIs(period?: string): Promise<ApiResponse<KPIData>> {
  if (shouldUseMockData()) {
    const { getKPIsForPeriod } = await getDemoData();
    return { data: getKPIsForPeriod(period || '7d') };
  }
  const query = period ? `?period=${period}` : '';
  return fetchApi<ApiResponse<KPIData>>(`/analysis/kpis${query}`);
}

export async function getTrends(): Promise<ApiResponse<TrendDataPoint[]>> {
  if (shouldUseMockData()) {
    const { demoTrends } = await getDemoData();
    return { data: demoTrends };
  }
  return fetchApi<ApiResponse<TrendDataPoint[]>>('/analysis/trends');
}

export async function getAnalysisToday(): Promise<ApiResponse<DailyAnalysis>> {
  if (shouldUseMockData()) {
    const { demoKPIs, demoBrief, demoTrends, demoOrdersTrends, demoStockoutRiskTrends, demoRecommendations } = await getDemoData();
    return {
      data: {
        date: new Date().toISOString(),
        kpis: demoKPIs,
        brief: demoBrief,
        trends: { revenue: demoTrends, orders: demoOrdersTrends, stockoutRisk: demoStockoutRiskTrends },
        topRecommendations: demoRecommendations.slice(0, 5),
      },
    };
  }
  return fetchApi<ApiResponse<DailyAnalysis>>('/analysis/today');
}

export async function getOpportunities(): Promise<ApiResponse<Opportunity[]>> {
  if (shouldUseMockData()) {
    // Build opportunities from demo recommendations
    const { demoRecommendations } = await getDemoData();
    const opportunities: Opportunity[] = demoRecommendations
      .filter((r) => ['bundle_opportunity', 'promotion_opportunity'].includes(r.type))
      .map((r) => ({
        id: r.id,
        type: r.type === 'bundle_opportunity' ? 'bundle' : 'promotion',
        title: r.title,
        description: r.summary,
        potentialImpact: r.impactValue ?? 0,
        confidence: r.confidence,
      }));
    return { data: opportunities };
  }
  return fetchApi<ApiResponse<Opportunity[]>>('/analysis/opportunities');
}

export async function getRootCauses(): Promise<ApiResponse<RootCause[]>> {
  if (shouldUseMockData()) {
    // Build root causes from demo data
    const rootCauses: RootCause[] = [
      {
        id: 'rc-1',
        issue: 'Brisket Bundle stockout imminent',
        cause: 'Velocity increased 23% faster than forecast due to seasonal demand',
        evidence: ['72 units remaining', '18 units/day velocity', '4 days to stockout'],
        severity: 'high',
      },
      {
        id: 'rc-2',
        issue: 'March 2024 cohort retention below benchmark',
        cause: 'Onboarding flow changed in March resulted in lower engagement',
        evidence: ['18% retention vs 32% benchmark', '847 customers affected'],
        severity: 'medium',
      },
    ];
    return { data: rootCauses };
  }
  return fetchApi<ApiResponse<RootCause[]>>('/analysis/root-causes');
}

// =============================================================================
// Inventory API
// =============================================================================

export async function getInventoryAnalysis(): Promise<ApiResponse<InventoryAnalysis>> {
  if (shouldUseMockData()) {
    const { demoInventoryAnalysis } = await getDemoData();
    return { data: demoInventoryAnalysis };
  }
  return fetchApi<ApiResponse<InventoryAnalysis>>('/inventory/analysis');
}

// =============================================================================
// Customer API
// =============================================================================

export async function getCustomerAnalysis(): Promise<ApiResponse<CustomerAnalysis>> {
  if (shouldUseMockData()) {
    const { demoCustomerAnalysis } = await getDemoData();
    return { data: demoCustomerAnalysis };
  }
  return fetchApi<ApiResponse<CustomerAnalysis>>('/customers/analysis');
}

// =============================================================================
// Ask API
// =============================================================================

export async function askQuestion(request: AskRequest): Promise<ApiResponse<AskResponse>> {
  if (shouldUseMockData()) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { demoAskResponses } = await getDemoData();
    const query = request.question.toLowerCase();

    // Match to pre-built demo responses
    if (query.includes('biggest risk') || query.includes('main risk') || query.includes('attention')) {
      return { data: demoAskResponses.biggest_risk };
    }
    if (query.includes('revenue down') || query.includes('revenue drop') || query.includes('why is revenue')) {
      return { data: demoAskResponses.revenue_down };
    }
    if (query.includes('pork') || query.includes('sampler') || query.includes('slow')) {
      return { data: demoAskResponses.pork_inventory };
    }

    // Fallback to biggest_risk for other questions
    return { data: demoAskResponses.biggest_risk };
  }
  return fetchApi<ApiResponse<AskResponse>>('/ask', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =============================================================================
// Simulation API
// =============================================================================

export async function runSimulation(
  type: 'stockout' | 'reorder' | 'discount' | 'bundle',
  input: SimulationInput
): Promise<ApiResponse<SimulationResult>> {
  if (shouldUseMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { demoSimulationResults } = await getDemoData();

    // Return specific demo simulation if available
    if (type === 'stockout') {
      return { data: demoSimulationResults.stockout_brisket };
    }
    if (type === 'reorder') {
      return { data: demoSimulationResults.reorder_brisket };
    }
    if (type === 'discount') {
      return { data: demoSimulationResults.discount_pork };
    }

    // Fallback to reorder simulation for bundle
    return { data: { ...demoSimulationResults.reorder_brisket, type: 'bundle' } };
  }
  return fetchApi<ApiResponse<SimulationResult>>(`/simulate/${type}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// =============================================================================
// Actions API
// =============================================================================

export async function executeAction(
  request: ActionExecuteRequest
): Promise<ApiResponse<ActionExecuteResponse>> {
  if (shouldUseMockData()) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Import services for demo mode
    const { executeAction: execAction, getActionExecutions } = await import('@/lib/services/action-execution');
    const {
      recordAcceptedEvent,
      recordDismissedEvent,
      recordActionQueuedEvent,
    } = await import('@/lib/services/recommendation-lifecycle');

    // Get recommendation
    const { demoRecommendations } = await getDemoData();
    const recommendation = demoRecommendations.find((r) => r.id === request.recommendationId);
    if (!recommendation) {
      throw new ApiError(404, 'NOT_FOUND', 'Recommendation not found');
    }

    // Execute the action
    const response = await execAction(request, recommendation);

    // Record lifecycle events
    if (request.actionType === 'dismiss_recommendation') {
      recordDismissedEvent(request.recommendationId, 'open', request.parameters.notes as string);
    } else if (request.actionType === 'mark_for_review') {
      recordAcceptedEvent(request.recommendationId, 'open');
    } else {
      recordAcceptedEvent(request.recommendationId, 'open');
      recordActionQueuedEvent(request.recommendationId, response.execution);
    }

    return { data: response };
  }

  return fetchApi<ApiResponse<ActionExecuteResponse>>('/actions/execute', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getActions(): Promise<ApiResponse<ActionExecution[]>> {
  if (shouldUseMockData()) {
    const { getActionExecutions } = await import('@/lib/services/action-execution');
    return { data: getActionExecutions() };
  }
  return fetchApi<ApiResponse<ActionExecution[]>>('/actions');
}

export async function getRecommendationHistory(
  recommendationId: string
): Promise<ApiResponse<RecommendationTimeline>> {
  if (shouldUseMockData()) {
    const { getRecommendationTimeline } = await import('@/lib/services/recommendation-lifecycle');
    return { data: getRecommendationTimeline(recommendationId) };
  }
  return fetchApi<ApiResponse<RecommendationTimeline>>(`/recommendations/${recommendationId}/history`);
}

// =============================================================================
// Changes API
// =============================================================================

export async function getLatestChanges(limit?: number): Promise<ApiResponse<ChangeEvent[]>> {
  if (shouldUseMockData()) {
    // Use seeded demo change events in demo mode
    if (USE_DEMO_DATA) {
      const { demoChangeEvents } = await import('@/lib/demo/data');
      const sorted = [...demoChangeEvents]
        .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
        .slice(0, limit || 10);
      return { data: sorted };
    }

    // Fall back to running change detection
    const { getLatestChanges: getChanges, runChangeDetection } = await import('@/lib/services/change-detection');
    const { demoKPIs, demoInventoryAnalysis, demoCustomerAnalysis } = await getDemoData();
    runChangeDetection(demoKPIs, demoInventoryAnalysis, demoCustomerAnalysis);
    return { data: getChanges(limit || 10) };
  }
  return fetchApi<ApiResponse<ChangeEvent[]>>(`/changes/latest${limit ? `?limit=${limit}` : ''}`);
}

export async function getChangeSummary(): Promise<ApiResponse<ChangeSummary>> {
  if (shouldUseMockData()) {
    // Build summary from seeded demo change events in demo mode
    if (USE_DEMO_DATA) {
      const { demoChangeEvents } = await import('@/lib/demo/data');
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      const positiveChanges = demoChangeEvents.filter((e) => e.direction === 'positive');
      const negativeChanges = demoChangeEvents.filter((e) => e.direction === 'negative');

      const summary: ChangeSummary = {
        period: { start: startDate, end: endDate },
        totalChanges: demoChangeEvents.length,
        criticalChanges: demoChangeEvents.filter((e) => e.significance === 'critical').length,
        positiveChanges: positiveChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)),
        negativeChanges: negativeChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)),
        byCategory: {
          revenue: demoChangeEvents.filter((e) =>
            ['revenue_up', 'revenue_down', 'orders_up', 'orders_down', 'aov_up', 'aov_down'].includes(e.changeType)
          ),
          inventory: demoChangeEvents.filter((e) =>
            ['sku_demand_up', 'sku_demand_down', 'new_stockout_risk', 'stockout_resolved', 'slow_mover_worsened', 'slow_mover_improved'].includes(e.changeType)
          ),
          customers: demoChangeEvents.filter((e) =>
            ['repeat_rate_up', 'repeat_rate_down', 'cohort_retention_dropped', 'cohort_retention_improved'].includes(e.changeType)
          ),
          operations: [],
        },
      };
      return { data: summary };
    }

    // Fall back to running change detection
    const { getChangeSummary: getSummary, runChangeDetection } = await import('@/lib/services/change-detection');
    const { demoKPIs, demoInventoryAnalysis, demoCustomerAnalysis } = await getDemoData();
    runChangeDetection(demoKPIs, demoInventoryAnalysis, demoCustomerAnalysis);
    return { data: getSummary() };
  }
  return fetchApi<ApiResponse<ChangeSummary>>('/changes/summary');
}

// =============================================================================
// Export client
// =============================================================================

export const api = {
  brief: {
    getToday: getBriefToday,
  },
  recommendations: {
    list: getRecommendations,
    get: getRecommendation,
    updateStatus: updateRecommendationStatus,
    getHistory: getRecommendationHistory,
  },
  analysis: {
    getToday: getAnalysisToday,
    getKPIs,
    getTrends,
    getOpportunities,
    getRootCauses,
  },
  inventory: {
    getAnalysis: getInventoryAnalysis,
  },
  customers: {
    getAnalysis: getCustomerAnalysis,
  },
  ask: askQuestion,
  simulate: runSimulation,
  actions: {
    execute: executeAction,
    list: getActions,
  },
  changes: {
    getLatest: getLatestChanges,
    getSummary: getChangeSummary,
  },
};

export { ApiError };
