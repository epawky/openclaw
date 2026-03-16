// =============================================================================
// Core Types
// =============================================================================

export type HealthState = 'positive' | 'warning' | 'negative' | 'neutral';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed' | 'in_progress';
export type RecommendationType =
  | 'stockout_risk'
  | 'promotion_opportunity'
  | 'slow_mover'
  | 'reorder_suggestion'
  | 'pricing_adjustment'
  | 'customer_retention'
  | 'bundle_opportunity';

export type RiskClass = 'critical' | 'high' | 'medium' | 'low' | 'healthy';

// =============================================================================
// KPI Types
// =============================================================================

export interface KPIValue {
  current: number;
  previous: number;
  unit?: 'currency' | 'percent' | 'number';
  healthState: HealthState;
}

export interface KPIData {
  revenue: KPIValue;
  orders: KPIValue;
  aov: KPIValue;
  returningCustomerRate: KPIValue;
  skusAtRisk: KPIValue;
  openRecommendations: KPIValue;
}

// =============================================================================
// Brief Types
// =============================================================================

export interface BriefIssue {
  id: string;
  title: string;
  severity: PriorityLevel;
  category: string;
}

export interface BriefAction {
  id: string;
  title: string;
  impact: string;
  recommendationId?: string;
}

export interface OperatingBrief {
  id: string;
  generatedAt: string;
  summary: string;
  topIssues: BriefIssue[];
  topActions: BriefAction[];
  confidence: ConfidenceLevel;
  dataFreshness: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// =============================================================================
// Recommendation Types
// =============================================================================

export interface RecommendationEvidence {
  type: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  summary: string;
  entity: string;
  entityType: 'sku' | 'customer_segment' | 'product_category' | 'general';
  priority: PriorityLevel;
  priorityRank: number;
  urgency: 'immediate' | 'this_week' | 'this_month' | 'low';
  impactEstimate: string;
  impactValue?: number;
  confidence: ConfidenceLevel;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
  why: string;
  evidence: RecommendationEvidence[];
  recommendedAction: string;
  relatedSignals: string[];
}

// =============================================================================
// Inventory Types
// =============================================================================

export interface InventorySKU {
  sku: string;
  productName: string;
  inventoryOnHand: number;
  velocity7Day: number;
  velocity30Day: number;
  daysRemaining: number;
  revenueContribution: number;
  riskClass: RiskClass;
  estimatedRevenueAtRisk: number;
}

export interface SlowMover {
  sku: string;
  productName: string;
  inventoryOnHand: number;
  unitsSold30Day: number;
  inventoryDays: number;
  revenue30Day: number;
  recommendation: string;
}

export interface PromotionCandidate {
  sku: string;
  productName: string;
  trend: 'rising' | 'stable' | 'declining';
  inventoryHealth: 'overstocked' | 'adequate' | 'low';
  revenue30Day: number;
  promotionScore: number;
}

export interface InventorySummary {
  criticalStockoutSKUs: number;
  estimatedRevenueAtRisk: number;
  slowMoversCount: number;
  topPromotionCandidate: string;
}

export interface InventoryAnalysis {
  summary: InventorySummary;
  stockoutRisks: InventorySKU[];
  slowMovers: SlowMover[];
  promotionCandidates: PromotionCandidate[];
}

// =============================================================================
// Customer Types
// =============================================================================

export interface CustomerMetrics {
  returningCustomerRate: number;
  repeatPurchaseRate: number;
  avgDaysBetweenPurchases: number;
  newCustomers30Day: number;
  returningCustomers30Day: number;
}

export interface CohortRetention {
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month4: number;
  month5: number;
  month6: number;
}

export interface CustomerAnalysis {
  metrics: CustomerMetrics;
  cohortRetention: CohortRetention[];
  recommendations: Recommendation[];
}

// =============================================================================
// Simulation Types
// =============================================================================

export type SimulationType = 'stockout' | 'reorder' | 'discount' | 'bundle';

export interface SimulationInput {
  type: SimulationType;
  parameters: Record<string, unknown>;
}

export interface SimulationResult {
  id: string;
  type: SimulationType;
  runAt: string;
  input: SimulationInput;
  outcome: {
    revenue: number;
    revenueDelta: number;
    units: number;
    margin: number;
    marginDelta: number;
  };
  assumptions: string[];
  confidence: ConfidenceLevel;
}

export interface SavedSimulation {
  id: string;
  name: string;
  type: SimulationType;
  createdAt: string;
  result: SimulationResult;
}

// =============================================================================
// Ask COO Types
// =============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredResponse?: StructuredResponse;
}

export interface StructuredResponse {
  directAnswer: string;
  supportingEvidence: {
    description: string;
    data?: Record<string, unknown>;
  }[];
  relatedRecommendations: {
    id: string;
    title: string;
  }[];
  suggestedFollowUps: string[];
  context: {
    tablesUsed: string[];
    recommendationIds: string[];
    confidence: ConfidenceLevel;
  };
}

export interface AskRequest {
  question: string;
  sessionId?: string;
}

export interface AskResponse {
  answer: string;
  structuredResponse: StructuredResponse;
}

// =============================================================================
// Trend Types (for charts)
// =============================================================================

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface TrendData {
  revenue: TrendDataPoint[];
  orders: TrendDataPoint[];
  stockoutRisk: TrendDataPoint[];
}

// =============================================================================
// Analysis Types
// =============================================================================

export interface Opportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  potentialImpact: number;
  confidence: ConfidenceLevel;
}

export interface RootCause {
  id: string;
  issue: string;
  cause: string;
  evidence: string[];
  severity: PriorityLevel;
}

export interface DailyAnalysis {
  date: string;
  kpis: KPIData;
  brief: OperatingBrief;
  trends: TrendData;
  topRecommendations: Recommendation[];
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RecommendationFilters {
  status?: RecommendationStatus[];
  type?: RecommendationType[];
  priority?: PriorityLevel[];
  dateRange?: DateRange;
}

// =============================================================================
// Store Types
// =============================================================================

export interface Store {
  id: string;
  name: string;
  domain: string;
  currency: string;
  timezone: string;
}
