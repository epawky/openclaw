import type {
  ApiResponse,
  AskRequest,
  AskResponse,
  CustomerAnalysis,
  DailyAnalysis,
  InventoryAnalysis,
  OperatingBrief,
  Opportunity,
  Recommendation,
  RootCause,
  SimulationInput,
  SimulationResult,
} from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

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
  if (USE_MOCK_DATA) {
    const { mockBrief } = await import('@/lib/mock-data');
    return { data: mockBrief };
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
  if (USE_MOCK_DATA) {
    const { mockRecommendations } = await import('@/lib/mock-data');
    let filtered = [...mockRecommendations];

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
  if (USE_MOCK_DATA) {
    const { mockRecommendations } = await import('@/lib/mock-data');
    const rec = mockRecommendations.find((r) => r.id === id);
    if (!rec) throw new ApiError(404, 'NOT_FOUND', 'Recommendation not found');
    return { data: rec };
  }
  return fetchApi<ApiResponse<Recommendation>>(`/recommendations/${id}`);
}

export async function updateRecommendationStatus(
  id: string,
  status: 'accepted' | 'dismissed'
): Promise<ApiResponse<Recommendation>> {
  if (USE_MOCK_DATA) {
    const { mockRecommendations } = await import('@/lib/mock-data');
    const rec = mockRecommendations.find((r) => r.id === id);
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

export async function getAnalysisToday(): Promise<ApiResponse<DailyAnalysis>> {
  if (USE_MOCK_DATA) {
    const { mockDailyAnalysis } = await import('@/lib/mock-data');
    return { data: mockDailyAnalysis };
  }
  return fetchApi<ApiResponse<DailyAnalysis>>('/analysis/today');
}

export async function getOpportunities(): Promise<ApiResponse<Opportunity[]>> {
  if (USE_MOCK_DATA) {
    const { mockOpportunities } = await import('@/lib/mock-data');
    return { data: mockOpportunities };
  }
  return fetchApi<ApiResponse<Opportunity[]>>('/analysis/opportunities');
}

export async function getRootCauses(): Promise<ApiResponse<RootCause[]>> {
  if (USE_MOCK_DATA) {
    const { mockRootCauses } = await import('@/lib/mock-data');
    return { data: mockRootCauses };
  }
  return fetchApi<ApiResponse<RootCause[]>>('/analysis/root-causes');
}

// =============================================================================
// Inventory API
// =============================================================================

export async function getInventoryAnalysis(): Promise<ApiResponse<InventoryAnalysis>> {
  if (USE_MOCK_DATA) {
    const { mockInventoryAnalysis } = await import('@/lib/mock-data');
    return { data: mockInventoryAnalysis };
  }
  return fetchApi<ApiResponse<InventoryAnalysis>>('/inventory/analysis');
}

// =============================================================================
// Customer API
// =============================================================================

export async function getCustomerAnalysis(): Promise<ApiResponse<CustomerAnalysis>> {
  if (USE_MOCK_DATA) {
    const { mockCustomerAnalysis } = await import('@/lib/mock-data');
    return { data: mockCustomerAnalysis };
  }
  return fetchApi<ApiResponse<CustomerAnalysis>>('/customers/analysis');
}

// =============================================================================
// Ask API
// =============================================================================

export async function askQuestion(request: AskRequest): Promise<ApiResponse<AskResponse>> {
  if (USE_MOCK_DATA) {
    const { generateMockAskResponse } = await import('@/lib/mock-data');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: generateMockAskResponse(request.question) };
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
  if (USE_MOCK_DATA) {
    const { generateMockSimulationResult } = await import('@/lib/mock-data');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { data: generateMockSimulationResult(type) };
  }
  return fetchApi<ApiResponse<SimulationResult>>(`/simulate/${type}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
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
  },
  analysis: {
    getToday: getAnalysisToday,
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
};

export { ApiError };
