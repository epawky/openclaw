// =============================================================================
// Demo Mode Seeded Data - Prairie Prime Meats
// =============================================================================
// A fictional premium meat ecommerce company with realistic scenarios
// that showcase the AI COO's value proposition.
// =============================================================================

import type {
  KPIData,
  OperatingBrief,
  Recommendation,
  InventoryAnalysis,
  CustomerAnalysis,
  TrendDataPoint,
  SimulationResult,
  AskResponse,
  RecommendationHistoryEvent,
  ActionExecution,
  ChangeEvent,
} from '@/lib/types';

// =============================================================================
// Company Context
// =============================================================================

export const demoCompanyInfo = {
  name: 'Prairie Prime Meats',
  tagline: 'Premium cuts, delivered fresh',
  industry: 'D2C Premium Meat Subscription',
  monthlyRevenue: 142000,
  avgOrderValue: 89,
  customerCount: 2847,
  skuCount: 24,
};

// =============================================================================
// KPI Data - Shows revenue decline scenario
// =============================================================================

// 7-day KPIs (default)
export const demoKPIs: KPIData = {
  revenue: {
    current: 28420,
    previous: 32295,
    unit: 'currency',
    healthState: 'negative',
  },
  orders: {
    current: 319,
    previous: 356,
    unit: 'number',
    healthState: 'negative',
  },
  aov: {
    current: 89.09,
    previous: 90.72,
    unit: 'currency',
    healthState: 'warning',
  },
  returningCustomerRate: {
    current: 24.5,
    previous: 28.2,
    unit: 'percent',
    healthState: 'warning',
  },
  skusAtRisk: {
    current: 4,
    previous: 2,
    unit: 'number',
    healthState: 'negative',
  },
  openRecommendations: {
    current: 6,
    previous: 4,
    unit: 'number',
    healthState: 'warning',
  },
};

// KPIs by time period
export const demoKPIsByPeriod: Record<string, KPIData> = {
  today: {
    revenue: {
      current: 4120,
      previous: 4680,
      unit: 'currency',
      healthState: 'negative',
    },
    orders: {
      current: 46,
      previous: 52,
      unit: 'number',
      healthState: 'negative',
    },
    aov: {
      current: 89.57,
      previous: 90.00,
      unit: 'currency',
      healthState: 'warning',
    },
    returningCustomerRate: {
      current: 24.5,
      previous: 28.2,
      unit: 'percent',
      healthState: 'warning',
    },
    skusAtRisk: {
      current: 4,
      previous: 2,
      unit: 'number',
      healthState: 'negative',
    },
    openRecommendations: {
      current: 6,
      previous: 4,
      unit: 'number',
      healthState: 'warning',
    },
  },
  '7d': demoKPIs,
  '30d': {
    revenue: {
      current: 118650,
      previous: 125400,
      unit: 'currency',
      healthState: 'negative',
    },
    orders: {
      current: 1342,
      previous: 1425,
      unit: 'number',
      healthState: 'negative',
    },
    aov: {
      current: 88.41,
      previous: 87.93,
      unit: 'currency',
      healthState: 'positive',
    },
    returningCustomerRate: {
      current: 26.8,
      previous: 29.4,
      unit: 'percent',
      healthState: 'warning',
    },
    skusAtRisk: {
      current: 4,
      previous: 3,
      unit: 'number',
      healthState: 'negative',
    },
    openRecommendations: {
      current: 6,
      previous: 5,
      unit: 'number',
      healthState: 'warning',
    },
  },
  '90d': {
    revenue: {
      current: 378200,
      previous: 362500,
      unit: 'currency',
      healthState: 'positive',
    },
    orders: {
      current: 4256,
      previous: 4089,
      unit: 'number',
      healthState: 'positive',
    },
    aov: {
      current: 88.87,
      previous: 88.66,
      unit: 'currency',
      healthState: 'positive',
    },
    returningCustomerRate: {
      current: 28.9,
      previous: 27.1,
      unit: 'percent',
      healthState: 'positive',
    },
    skusAtRisk: {
      current: 4,
      previous: 5,
      unit: 'number',
      healthState: 'positive',
    },
    openRecommendations: {
      current: 6,
      previous: 8,
      unit: 'number',
      healthState: 'positive',
    },
  },
};

// Helper function to get KPIs for a specific period
export function getKPIsForPeriod(period: string): KPIData {
  return demoKPIsByPeriod[period] || demoKPIs;
}

// =============================================================================
// Operating Brief - AI's daily summary
// =============================================================================

export const demoBrief: OperatingBrief = {
  id: 'brief-demo-001',
  generatedAt: new Date().toISOString(),
  summary: `Revenue is down 12% this week, primarily driven by the Brisket Bundle approaching stockout. Your best-seller has only 4 days of inventory remaining at current velocity. Additionally, the Pork Sampler Box is moving slowly with expiry concerns. I recommend expediting the brisket reorder and running a flash sale on pork products.`,
  topIssues: [
    {
      id: 'issue-brisket-stockout',
      title: 'Brisket Bundle Stockout Imminent - Only 4 days of inventory remaining',
      severity: 'critical',
      category: 'inventory',
    },
    {
      id: 'issue-pork-slow',
      title: 'Pork Sampler Slow Mover - 45 days inventory with 8-day expiry concern',
      severity: 'high',
      category: 'inventory',
    },
    {
      id: 'issue-retention',
      title: 'March Cohort Retention Drop - 18% vs 32% benchmark',
      severity: 'high',
      category: 'customers',
    },
  ],
  topActions: [
    {
      id: 'action-brisket-reorder',
      title: 'Expedite Brisket Bundle reorder (150 units)',
      impact: 'Prevent $8,900 revenue loss',
      recommendationId: 'rec-reorder-brisket',
    },
    {
      id: 'action-pork-discount',
      title: 'Run 15% flash sale on Pork Sampler',
      impact: 'Recover $2,880 vs $3,200 waste',
      recommendationId: 'rec-discount-pork',
    },
    {
      id: 'action-retention',
      title: 'Launch win-back campaign for March cohort',
      impact: 'Recover $11,300 from lapsed customers',
      recommendationId: 'rec-retention-march',
    },
  ],
  confidence: 'high',
  dataFreshness: 'fresh',
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
};

// =============================================================================
// Recommendations - Prioritized action queue
// =============================================================================

export const demoRecommendations: Recommendation[] = [
  {
    id: 'rec-reorder-brisket',
    type: 'stockout_risk',
    title: 'Expedite Brisket Bundle Reorder',
    summary: 'Your top seller (40% of revenue) will stock out in 4 days. Expedited reorder recommended to prevent $8,900 revenue loss.',
    entity: 'Brisket Bundle',
    entityType: 'sku',
    priority: 'critical',
    priorityRank: 1,
    urgency: 'immediate',
    impactEstimate: 'Prevent $8,900 revenue loss',
    impactValue: 8900,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    why: 'At current velocity of 18 units/day, you have only 4 days of inventory remaining. Standard reorder lead time is 7 days. A stockout would result in $12,400 lost revenue per week plus customer churn risk.',
    evidence: [
      { type: 'inventory', description: 'Current stock: 72 units' },
      { type: 'velocity', description: 'Daily sales: 18 units/day' },
      { type: 'timeline', description: 'Days to stockout: 4 days' },
      { type: 'revenue', description: 'Weekly revenue at risk: $12,400' },
    ],
    recommendedAction: 'Place expedited order for 150 units. Contact supplier for rush processing. Expedited shipping costs $800 but prevents $8,900 revenue loss.',
    relatedSignals: ['inventory_low', 'high_velocity', 'revenue_concentration'],
  },
  {
    id: 'rec-discount-pork',
    type: 'slow_mover',
    title: 'Flash Sale on Pork Sampler Box',
    summary: '45 days of inventory but quality concerns in 8 days. 15% discount projected to move 60% of stock and recover $2,880 vs $3,200 waste.',
    entity: 'Pork Sampler Box',
    entityType: 'sku',
    priority: 'high',
    priorityRank: 2,
    urgency: 'this_week',
    impactEstimate: 'Recover $2,880 vs $3,200 waste',
    impactValue: 2880,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    why: 'Without intervention, you risk $3,200 in product waste. A 15% discount sacrifices $720 in margin but recovers $2,880 in revenue and clears aging inventory.',
    evidence: [
      { type: 'inventory', description: 'Current stock: 89 units' },
      { type: 'velocity', description: 'Days of supply: 45 days' },
      { type: 'quality', description: 'Quality deadline: 8 days' },
      { type: 'value', description: 'At-risk inventory value: $3,200' },
    ],
    recommendedAction: 'Apply 15% discount for 7 days. Feature in email newsletter. Add homepage banner to drive awareness.',
    relatedSignals: ['slow_velocity', 'aging_inventory', 'margin_risk'],
  },
  {
    id: 'rec-retention-march',
    type: 'customer_retention',
    title: 'Win-Back Campaign for March Cohort',
    summary: 'March 2024 cohort shows 18% retention vs 32% benchmark. 847 customers at risk representing $75,400/year.',
    entity: 'March 2024 Cohort',
    entityType: 'customer_segment',
    priority: 'high',
    priorityRank: 3,
    urgency: 'this_week',
    impactEstimate: 'Recover $11,300 from lapsed customers',
    impactValue: 11300,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    why: 'Customer acquisition cost is $45. Reactivating 15% of lapsed customers (127 customers) at $89 AOV would generate $11,300 revenue at minimal marginal cost.',
    evidence: [
      { type: 'cohort', description: 'Cohort size: 847 customers' },
      { type: 'retention', description: 'Current retention: 18%' },
      { type: 'benchmark', description: 'Benchmark retention: 32%' },
      { type: 'revenue', description: 'Annual revenue at risk: $75,400' },
    ],
    recommendedAction: 'Send personalized win-back email with 10% return discount. Highlight new summer products to rekindle interest.',
    relatedSignals: ['retention_drop', 'cohort_underperformance', 'churn_risk'],
  },
  {
    id: 'rec-bundle-ribeye-seasoning',
    type: 'bundle_opportunity',
    title: 'Create Ribeye + Seasoning Bundle',
    summary: '67% of Ribeye Box purchasers buy Steak Seasoning within 30 days. Bundle could increase AOV by $24.',
    entity: 'Ribeye Box + Seasoning',
    entityType: 'product_category',
    priority: 'medium',
    priorityRank: 4,
    urgency: 'this_month',
    impactEstimate: 'Increase AOV by $24',
    impactValue: 4800,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    why: 'Bundling these items with a 5% discount still increases margin by offering convenience. Projected AOV increase of $24 per bundle sold.',
    evidence: [
      { type: 'affinity', description: 'Co-purchase rate: 67%' },
      { type: 'pricing', description: 'Ribeye Box: $129, Seasoning: $34' },
      { type: 'bundle', description: 'Proposed bundle: $155 (5% off)' },
      { type: 'impact', description: 'AOV lift: +$24' },
    ],
    recommendedAction: 'Create bundle product in Shopify with 5% discount. Feature on product pages and cross-sell during checkout.',
    relatedSignals: ['cross_sell_opportunity', 'high_affinity', 'aov_optimization'],
  },
  {
    id: 'rec-promo-ribeye',
    type: 'promotion_opportunity',
    title: 'Weekend Ribeye Promotion',
    summary: 'Ribeye Box sales spike 40% on weekends. Free shipping Friday email could generate $3,025 incremental revenue.',
    entity: 'Ribeye Box',
    entityType: 'sku',
    priority: 'medium',
    priorityRank: 5,
    urgency: 'this_week',
    impactEstimate: 'Generate $3,025 incremental revenue',
    impactValue: 3025,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    why: 'Free shipping costs $8/order on average. If it converts 25 additional orders at $129 each, net revenue gain is $3,025.',
    evidence: [
      { type: 'pattern', description: 'Weekend sales lift: +40%' },
      { type: 'baseline', description: 'Avg weekend orders: 62' },
      { type: 'target', description: 'Target orders: 87' },
      { type: 'cost', description: 'Shipping cost: $8/order' },
    ],
    recommendedAction: 'Schedule Friday 10am email blast with free shipping offer. Update homepage hero to highlight weekend promotion.',
    relatedSignals: ['seasonal_pattern', 'promotion_opportunity', 'weekend_spike'],
  },
  {
    id: 'rec-reorder-burger',
    type: 'reorder_suggestion',
    title: 'Standard Reorder: Burger Pack',
    summary: '12 days of inventory remaining with 5-day lead time. Standard reorder within 7 days maintains stock levels.',
    entity: 'Burger Pack',
    entityType: 'sku',
    priority: 'low',
    priorityRank: 6,
    urgency: 'this_month',
    impactEstimate: 'Maintain stock levels',
    impactValue: 0,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    why: 'This is a routine reorder with comfortable runway. No expedited shipping needed.',
    evidence: [
      { type: 'inventory', description: 'Current stock: 84 units' },
      { type: 'velocity', description: 'Daily sales: 7 units/day' },
      { type: 'timeline', description: 'Days to stockout: 12 days' },
      { type: 'logistics', description: 'Lead time: 5 days' },
    ],
    recommendedAction: 'Place standard reorder for 100 units. Review velocity trend for quantity adjustment.',
    relatedSignals: ['routine_reorder', 'stable_velocity'],
  },
];

// =============================================================================
// Inventory Analysis
// =============================================================================

export const demoInventoryAnalysis: InventoryAnalysis = {
  summary: {
    criticalStockoutSKUs: 2,
    estimatedRevenueAtRisk: 16250,
    slowMoversCount: 2,
    topPromotionCandidate: 'Ribeye Box',
  },
  stockoutRisks: [
    {
      sku: 'SKU-BB-001',
      productName: 'Brisket Bundle',
      inventoryOnHand: 72,
      velocity7Day: 126,
      velocity30Day: 540,
      daysRemaining: 4,
      revenueContribution: 0.40,
      riskClass: 'critical',
      estimatedRevenueAtRisk: 12400,
    },
    {
      sku: 'SKU-SF-001',
      productName: 'Steak Flight Sampler',
      inventoryOnHand: 34,
      velocity7Day: 35,
      velocity30Day: 150,
      daysRemaining: 7,
      revenueContribution: 0.12,
      riskClass: 'high',
      estimatedRevenueAtRisk: 3850,
    },
  ],
  slowMovers: [
    {
      sku: 'SKU-PS-001',
      productName: 'Pork Sampler Box',
      inventoryOnHand: 89,
      unitsSold30Day: 60,
      inventoryDays: 45,
      revenue30Day: 2160,
      recommendation: 'Run 15% discount promotion',
    },
    {
      sku: 'SKU-LC-001',
      productName: 'Lamb Chops Premium',
      inventoryOnHand: 56,
      unitsSold30Day: 30,
      inventoryDays: 56,
      revenue30Day: 2400,
      recommendation: 'Monitor - consider bundle with beef',
    },
  ],
  promotionCandidates: [
    {
      sku: 'SKU-RB-001',
      productName: 'Ribeye Box',
      trend: 'rising',
      inventoryHealth: 'adequate',
      revenue30Day: 15480,
      promotionScore: 85,
    },
  ],
};

// =============================================================================
// Customer Analysis
// =============================================================================

export const demoCustomerAnalysis: CustomerAnalysis = {
  metrics: {
    returningCustomerRate: 24.5,
    repeatPurchaseRate: 31.2,
    avgDaysBetweenPurchases: 42,
    newCustomers30Day: 234,
    returningCustomers30Day: 312,
  },
  cohortRetention: [
    { cohort: 'Jan 2024', month0: 100, month1: 68, month2: 52, month3: 41, month4: 35, month5: 31, month6: 28 },
    { cohort: 'Feb 2024', month0: 100, month1: 71, month2: 55, month3: 44, month4: 38, month5: 33, month6: 29 },
    { cohort: 'Mar 2024', month0: 100, month1: 58, month2: 38, month3: 26, month4: 21, month5: 18, month6: 15 },
    { cohort: 'Apr 2024', month0: 100, month1: 72, month2: 58, month3: 47, month4: 40, month5: 34, month6: 30 },
    { cohort: 'May 2024', month0: 100, month1: 69, month2: 54, month3: 43, month4: 36, month5: 31, month6: 27 },
  ],
  recommendations: [demoRecommendations[2]], // Include the March cohort retention recommendation
};

// =============================================================================
// Trend Data
// =============================================================================

export const demoTrends: TrendDataPoint[] = [
  { date: '2024-06-01', value: 4120 },
  { date: '2024-06-02', value: 4890 },
  { date: '2024-06-03', value: 3980 },
  { date: '2024-06-04', value: 4210 },
  { date: '2024-06-05', value: 4560 },
  { date: '2024-06-06', value: 5120 },
  { date: '2024-06-07', value: 5890 },
  { date: '2024-06-08', value: 4020 },
  { date: '2024-06-09', value: 3890 },
  { date: '2024-06-10', value: 3780 },
  { date: '2024-06-11', value: 4120 },
  { date: '2024-06-12', value: 4340 },
  { date: '2024-06-13', value: 4890 },
  { date: '2024-06-14', value: 5340 },
];

// =============================================================================
// Simulation Results Templates
// =============================================================================

export const demoSimulationResults: Record<string, SimulationResult> = {
  stockout_brisket: {
    id: 'sim-stockout-001',
    type: 'stockout',
    runAt: new Date().toISOString(),
    input: {
      type: 'stockout',
      parameters: {
        sku: 'SKU-BB-001',
        daysToStockout: 4,
      },
    },
    outcome: {
      revenue: 0,
      revenueDelta: -12400,
      margin: 0,
      marginDelta: -5208,
      units: 0,
    },
    assumptions: [
      'No substitute product available',
      'Lost customers do not return within 30 days',
      'Supplier cannot expedite beyond 7 days',
    ],
    confidence: 'high',
  },
  reorder_brisket: {
    id: 'sim-reorder-001',
    type: 'reorder',
    runAt: new Date().toISOString(),
    input: {
      type: 'reorder',
      parameters: {
        sku: 'SKU-BB-001',
        quantity: 150,
        expedite: true,
      },
    },
    outcome: {
      revenue: 12400,
      revenueDelta: 8900,
      margin: 5208,
      marginDelta: 3738,
      units: 150,
    },
    assumptions: [
      'Expedited shipping costs $800',
      'Supplier confirms availability',
      'Demand remains constant',
    ],
    confidence: 'high',
  },
  discount_pork: {
    id: 'sim-discount-001',
    type: 'discount',
    runAt: new Date().toISOString(),
    input: {
      type: 'discount',
      parameters: {
        sku: 'SKU-PS-001',
        discountPercent: 15,
        durationDays: 7,
      },
    },
    outcome: {
      revenue: 2880,
      revenueDelta: 2160,
      margin: 864,
      marginDelta: 144,
      units: 53,
    },
    assumptions: [
      'Price elasticity of 1.6',
      'No cannibalization of other products',
      'Email promotion sent to full list',
    ],
    confidence: 'medium',
  },
};

// =============================================================================
// Ask COO Pre-built Responses
// =============================================================================

export const demoAskResponses: Record<string, AskResponse> = {
  biggest_risk: {
    answer: `Your biggest immediate risk is the **Brisket Bundle stockout**. With only 4 days of inventory remaining and a 7-day lead time, you're facing a $12,400/week revenue loss if action isn't taken today.

The Brisket Bundle is your anchor product (40% of revenue). Customers who buy it have 67% higher lifetime value. A stockout doesn't just lose immediate sales—it risks losing your best customers to competitors.

**Recommended Action:** Expedite a reorder of 150 units immediately. Yes, expedited shipping costs $800, but that prevents $8,900 in lost revenue. The math is clear: spend $800 to save $8,900.`,
    structuredResponse: {
      directAnswer: 'Brisket Bundle stockout in 4 days - $12,400/week revenue at risk',
      supportingEvidence: [
        { description: 'Current stock: 72 units' },
        { description: 'Daily velocity: 18 units/day' },
        { description: 'Time to stockout: 4 days' },
        { description: 'Revenue at risk: $12,400/week (40% of total)' },
      ],
      relatedRecommendations: [
        { id: 'rec-reorder-brisket', title: 'Expedite Brisket Bundle Reorder' },
      ],
      suggestedFollowUps: [
        'Should I run a simulation on the reorder?',
        'What suppliers can expedite delivery?',
        'How do I prevent this in the future?',
      ],
      context: {
        tablesUsed: ['inventory', 'sales_velocity', 'supplier_lead_times'],
        recommendationIds: ['rec-reorder-brisket'],
        confidence: 'high',
      },
    },
  },
  revenue_down: {
    answer: `Revenue is down **12%** this week, primarily due to reduced Brisket Bundle availability and lower conversion rates. The impending stockout is already affecting sales.

**Root Causes:**
1. **Brisket Bundle Stock Issues** (-$2,100): Popular sizes sold out, cart abandonment up 34%
2. **Conversion Rate Drop** (-15.8%): Fell from 3.8% to 3.2%, correlated with inventory issues
3. **Missed Weekend Promotion** (-$890): No Friday email sent, typically drives 40% lift

**Path to Recovery:** Fix the brisket supply first—it's causing cascading effects. Then execute the weekend ribeye promotion to recover momentum.`,
    structuredResponse: {
      directAnswer: 'Revenue down 12% due to Brisket Bundle availability and missed promotions',
      supportingEvidence: [
        { description: 'Brisket Bundle: -$2,100 (54% of decline)' },
        { description: 'Ribeye Box: -$890 (23% of decline)' },
        { description: 'Conversion rate: 3.8% → 3.2%' },
        { description: 'Cart abandonment up 34%' },
      ],
      relatedRecommendations: [
        { id: 'rec-reorder-brisket', title: 'Expedite Brisket Bundle Reorder' },
        { id: 'rec-promo-ribeye', title: 'Weekend Ribeye Promotion' },
      ],
      suggestedFollowUps: [
        'How can I speed up the brisket reorder?',
        'What email should I send this Friday?',
        'Show me the conversion funnel details',
      ],
      context: {
        tablesUsed: ['daily_revenue', 'conversion_funnel', 'cart_abandonment', 'email_campaigns'],
        recommendationIds: ['rec-reorder-brisket', 'rec-promo-ribeye'],
        confidence: 'high',
      },
    },
  },
  pork_inventory: {
    answer: `Run a **15% flash sale for 7 days**. You'll recover $2,880 in revenue versus risking $3,200 in waste.

**Current State:**
- Stock: 89 units ($3,200 value)
- Velocity: 2 units/day (45 days of supply)
- Quality concern: 8 days

With a 15% discount and email promotion to 1,247 pork buyers, price elasticity data suggests you'll move 53 units in 7 days, clearing the at-risk inventory while preserving margin.`,
    structuredResponse: {
      directAnswer: 'Run 15% flash sale - recover $2,880 vs $3,200 potential waste',
      supportingEvidence: [
        { description: 'Current stock: 89 units ($3,200 value)' },
        { description: 'Quality deadline: 8 days' },
        { description: 'Expected units moved with 15% discount: 53' },
        { description: 'Pork buyer segment: 1,247 customers' },
      ],
      relatedRecommendations: [
        { id: 'rec-discount-pork', title: 'Flash Sale on Pork Sampler Box' },
      ],
      suggestedFollowUps: [
        'Run a simulation on the discount',
        'What if I do 20% instead?',
        'How quickly will the sale clear inventory?',
      ],
      context: {
        tablesUsed: ['inventory_age', 'price_elasticity', 'customer_segments'],
        recommendationIds: ['rec-discount-pork'],
        confidence: 'medium',
      },
    },
  },
};

// =============================================================================
// Seeded Recommendation History - Shows lifecycle in action
// =============================================================================

const createDate = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

export const demoRecommendationHistory: RecommendationHistoryEvent[] = [
  // Brisket reorder - created and viewed
  {
    id: 'hist-001',
    recommendationId: 'rec-reorder-brisket',
    eventType: 'created',
    previousStatus: undefined,
    newStatus: 'open',
    summary: 'Recommendation created by AI agent',
    metadata: {
      triggeredBy: 'system',
      detectionReason: 'inventory_velocity_analysis',
    },
    createdAt: createDate(48),
  },
  {
    id: 'hist-002',
    recommendationId: 'rec-reorder-brisket',
    eventType: 'viewed',
    previousStatus: 'open',
    newStatus: 'open',
    summary: 'Viewed by user',
    metadata: {},
    createdAt: createDate(36),
  },

  // Pork discount - created, viewed
  {
    id: 'hist-003',
    recommendationId: 'rec-discount-pork',
    eventType: 'created',
    previousStatus: undefined,
    newStatus: 'open',
    summary: 'Recommendation created by AI agent',
    metadata: {
      triggeredBy: 'system',
      detectionReason: 'slow_mover_analysis',
    },
    createdAt: createDate(72),
  },
  {
    id: 'hist-004',
    recommendationId: 'rec-discount-pork',
    eventType: 'viewed',
    previousStatus: 'open',
    newStatus: 'open',
    summary: 'Viewed by user',
    metadata: {},
    createdAt: createDate(48),
  },

  // March cohort retention - created and viewed
  {
    id: 'hist-005',
    recommendationId: 'rec-retention-march',
    eventType: 'created',
    previousStatus: undefined,
    newStatus: 'open',
    summary: 'Recommendation created by AI agent',
    metadata: {
      triggeredBy: 'system',
      detectionReason: 'cohort_analysis',
    },
    createdAt: createDate(168), // 7 days ago
  },
  {
    id: 'hist-006',
    recommendationId: 'rec-retention-march',
    eventType: 'viewed',
    previousStatus: 'open',
    newStatus: 'open',
    summary: 'Viewed by user',
    metadata: {},
    createdAt: createDate(156),
  },

  // Bundle opportunity - just created
  {
    id: 'hist-007',
    recommendationId: 'rec-bundle-ribeye-seasoning',
    eventType: 'created',
    previousStatus: undefined,
    newStatus: 'open',
    summary: 'Recommendation created by AI agent',
    metadata: {
      triggeredBy: 'system',
      detectionReason: 'cross_sell_analysis',
    },
    createdAt: createDate(24),
  },

  // Weekend promo - created and viewed
  {
    id: 'hist-008',
    recommendationId: 'rec-promo-ribeye',
    eventType: 'created',
    previousStatus: undefined,
    newStatus: 'open',
    summary: 'Recommendation created by AI agent',
    metadata: {
      triggeredBy: 'system',
      detectionReason: 'seasonal_pattern_analysis',
    },
    createdAt: createDate(96),
  },
  {
    id: 'hist-009',
    recommendationId: 'rec-promo-ribeye',
    eventType: 'viewed',
    previousStatus: 'open',
    newStatus: 'open',
    summary: 'Viewed by user',
    metadata: {},
    createdAt: createDate(72),
  },

  // Burger reorder - routine, just created
  {
    id: 'hist-010',
    recommendationId: 'rec-reorder-burger',
    eventType: 'created',
    previousStatus: undefined,
    newStatus: 'open',
    summary: 'Recommendation created by AI agent',
    metadata: {
      triggeredBy: 'system',
      detectionReason: 'inventory_routine_check',
    },
    createdAt: createDate(48),
  },
];

// =============================================================================
// Seeded Past Action Executions - Shows what was done before
// =============================================================================

export const demoPastActions: ActionExecution[] = [
  // A previous successful reorder from 2 weeks ago
  {
    id: 'exec-past-001',
    recommendationId: 'rec-past-reorder-ribeye',
    actionType: 'reorder_inventory',
    status: 'completed',
    parameters: {
      quantity: 100,
      expedite: false,
      notes: 'Standard reorder - no rush needed',
    },
    createdAt: createDate(336), // 14 days ago
    completedAt: createDate(168), // 7 days ago
    summary: 'Reordered 100 units of Ribeye Box',
    result: {
      success: true,
      message: 'Inventory reorder placed successfully',
      data: {
        orderNumber: 'PO-2024-0892',
        quantity: 100,
        estimatedInventoryCoverageDays: 14,
      },
    },
  },
  // A previous promotion that ran successfully
  {
    id: 'exec-past-002',
    recommendationId: 'rec-past-promo-memorial',
    actionType: 'launch_promotion',
    status: 'completed',
    parameters: {
      discountPercent: 10,
      durationDays: 3,
    },
    createdAt: createDate(504), // 3 weeks ago
    completedAt: createDate(432), // 2.5 weeks ago
    summary: 'Memorial Day Weekend Promotion - 10% off all orders',
    result: {
      success: true,
      message: 'Promotion launched successfully',
      data: {
        promotionId: 'promo-memorial-2024',
        projectedRevenue: 10500,
        projectedUnits: 147,
      },
    },
  },
  // A retention campaign that was queued
  {
    id: 'exec-past-003',
    recommendationId: 'rec-past-retention-feb',
    actionType: 'queue_retention_campaign',
    status: 'completed',
    parameters: {
      segmentId: 'feb-2024-lapsed',
      campaignName: 'Win-back Feb 2024 Cohort',
    },
    createdAt: createDate(672), // 4 weeks ago
    completedAt: createDate(504), // 3 weeks ago
    summary: 'Win-back campaign for February cohort',
    result: {
      success: true,
      message: 'Retention campaign queued successfully',
      data: {
        campaignId: 'retention-feb-2024',
        projectedRevenue: 3500,
      },
    },
  },
];

// =============================================================================
// Seeded Change Events - Recent meaningful changes detected
// =============================================================================

const createChangeDate = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString().split('T')[0];

export const demoChangeEvents: ChangeEvent[] = [
  // Critical: Revenue decline
  {
    id: 'change-001',
    changeDate: createChangeDate(2),
    changeType: 'revenue_down',
    entityType: 'store',
    entityId: 'store-main',
    entityName: 'Prairie Prime Meats',
    metricName: 'Weekly Revenue',
    currentValue: 28420,
    priorValue: 32295,
    absoluteChange: -3875,
    percentChange: -12.0,
    significance: 'critical',
    direction: 'negative',
    evidence: [
      { description: 'Weekly revenue declined 12% vs previous week' },
      { description: 'Primary driver: Brisket Bundle availability issues' },
    ],
    relatedRecommendationIds: ['rec-reorder-brisket'],
    detectedAt: createDate(2),
  },
  // High: Orders decline
  {
    id: 'change-002',
    changeDate: createChangeDate(2),
    changeType: 'orders_down',
    entityType: 'store',
    entityId: 'store-main',
    entityName: 'Prairie Prime Meats',
    metricName: 'Weekly Orders',
    currentValue: 319,
    priorValue: 356,
    absoluteChange: -37,
    percentChange: -10.4,
    significance: 'high',
    direction: 'negative',
    evidence: [
      { description: '37 fewer orders than previous week' },
    ],
    detectedAt: createDate(2),
  },
  // High: Brisket Bundle velocity spike leading to stockout
  {
    id: 'change-003',
    changeDate: createChangeDate(4),
    changeType: 'sku_demand_up',
    entityType: 'sku',
    entityId: 'SKU-BB-001',
    entityName: 'Brisket Bundle',
    metricName: 'Daily Velocity',
    currentValue: 18,
    priorValue: 14.6,
    absoluteChange: 3.4,
    percentChange: 23.3,
    significance: 'high',
    direction: 'positive',
    evidence: [
      { description: 'Velocity increased 23% - faster sell-through than forecast' },
      { description: 'Only 4 days of inventory remaining at current velocity' },
    ],
    relatedRecommendationIds: ['rec-reorder-brisket'],
    detectedAt: createDate(4),
  },
  // Critical: Stockout risk
  {
    id: 'change-004',
    changeDate: createChangeDate(1),
    changeType: 'new_stockout_risk',
    entityType: 'sku',
    entityId: 'SKU-BB-001',
    entityName: 'Brisket Bundle',
    metricName: 'Days to Stockout',
    currentValue: 4,
    priorValue: 8,
    absoluteChange: -4,
    percentChange: -50,
    significance: 'critical',
    direction: 'negative',
    evidence: [
      { description: 'Only 4 days of inventory remaining' },
      { description: '$12,400 revenue at risk per week' },
      { description: '72 units on hand, 18 units/day velocity' },
    ],
    relatedRecommendationIds: ['rec-reorder-brisket'],
    detectedAt: createDate(1),
  },
  // High: March cohort retention drop
  {
    id: 'change-005',
    changeDate: createChangeDate(6),
    changeType: 'cohort_retention_dropped',
    entityType: 'cohort',
    entityId: 'cohort-mar-2024',
    entityName: 'March 2024 Cohort',
    metricName: 'Month 3 Retention',
    currentValue: 18,
    priorValue: 32,
    absoluteChange: -14,
    percentChange: -43.75,
    significance: 'high',
    direction: 'negative',
    evidence: [
      { description: 'Retention at 18% vs 32% benchmark' },
      { description: '847 customers in cohort' },
      { description: '$75,400/year revenue at risk' },
    ],
    relatedRecommendationIds: ['rec-retention-march'],
    detectedAt: createDate(6),
  },
  // Medium: AOV slight decline
  {
    id: 'change-006',
    changeDate: createChangeDate(2),
    changeType: 'aov_down',
    entityType: 'store',
    entityId: 'store-main',
    entityName: 'Prairie Prime Meats',
    metricName: 'Average Order Value',
    currentValue: 89.09,
    priorValue: 90.72,
    absoluteChange: -1.63,
    percentChange: -1.8,
    significance: 'low',
    direction: 'negative',
    evidence: [
      { description: 'AOV declined from $90.72 to $89.09' },
    ],
    detectedAt: createDate(2),
  },
  // Medium: Pork slow mover flagged
  {
    id: 'change-007',
    changeDate: createChangeDate(4),
    changeType: 'slow_mover_worsened',
    entityType: 'sku',
    entityId: 'SKU-PS-001',
    entityName: 'Pork Sampler Box',
    metricName: 'Days of Inventory',
    currentValue: 45,
    priorValue: 28,
    absoluteChange: 17,
    percentChange: 60.7,
    significance: 'medium',
    direction: 'negative',
    evidence: [
      { description: 'Now 45 days of inventory on hand' },
      { description: 'Quality deadline in 8 days' },
      { description: '$3,200 at risk of waste' },
    ],
    relatedRecommendationIds: ['rec-discount-pork'],
    detectedAt: createDate(4),
  },
  // Medium: Returning customer rate
  {
    id: 'change-008',
    changeDate: createChangeDate(12),
    changeType: 'repeat_rate_down',
    entityType: 'store',
    entityId: 'store-main',
    entityName: 'Prairie Prime Meats',
    metricName: 'Returning Customer Rate',
    currentValue: 24.5,
    priorValue: 28.2,
    absoluteChange: -3.7,
    percentChange: -13.1,
    significance: 'medium',
    direction: 'negative',
    evidence: [
      { description: 'Returning customer rate down from 28.2% to 24.5%' },
    ],
    detectedAt: createDate(12),
  },
  // Positive: Ribeye weekend pattern identified
  {
    id: 'change-009',
    changeDate: createChangeDate(24),
    changeType: 'sku_demand_up',
    entityType: 'sku',
    entityId: 'SKU-RB-001',
    entityName: 'Ribeye Box',
    metricName: 'Weekend Sales',
    currentValue: 63,
    priorValue: 45,
    absoluteChange: 18,
    percentChange: 40,
    significance: 'medium',
    direction: 'positive',
    evidence: [
      { description: 'Weekend sales up 40%' },
      { description: 'Promotion opportunity identified' },
      { description: 'Avg weekend orders: 62' },
    ],
    relatedRecommendationIds: ['rec-promo-ribeye'],
    detectedAt: createDate(24),
  },
];

// =============================================================================
// Export All Demo Data
// =============================================================================

export const demoData = {
  company: demoCompanyInfo,
  kpis: demoKPIs,
  brief: demoBrief,
  recommendations: demoRecommendations,
  inventoryAnalysis: demoInventoryAnalysis,
  customerAnalysis: demoCustomerAnalysis,
  trends: demoTrends,
  simulationResults: demoSimulationResults,
  askResponses: demoAskResponses,
  recommendationHistory: demoRecommendationHistory,
  pastActions: demoPastActions,
  changeEvents: demoChangeEvents,
};
