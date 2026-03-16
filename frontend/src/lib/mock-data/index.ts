import type {
  AskResponse,
  CohortRetention,
  CustomerAnalysis,
  DailyAnalysis,
  InventoryAnalysis,
  InventorySKU,
  KPIData,
  OperatingBrief,
  Opportunity,
  PromotionCandidate,
  Recommendation,
  RootCause,
  SimulationResult,
  SlowMover,
  TrendData,
} from '@/lib/types';

// =============================================================================
// KPI Data
// =============================================================================

export const mockKPIs: KPIData = {
  revenue: {
    current: 127450,
    previous: 118200,
    unit: 'currency',
    healthState: 'positive',
  },
  orders: {
    current: 342,
    previous: 328,
    unit: 'number',
    healthState: 'positive',
  },
  aov: {
    current: 372.66,
    previous: 360.37,
    unit: 'currency',
    healthState: 'positive',
  },
  returningCustomerRate: {
    current: 34.2,
    previous: 31.8,
    unit: 'percent',
    healthState: 'positive',
  },
  skusAtRisk: {
    current: 7,
    previous: 4,
    unit: 'number',
    healthState: 'warning',
  },
  openRecommendations: {
    current: 12,
    previous: 8,
    unit: 'number',
    healthState: 'neutral',
  },
};

// =============================================================================
// Operating Brief
// =============================================================================

export const mockBrief: OperatingBrief = {
  id: 'brief-2024-01-15',
  generatedAt: new Date().toISOString(),
  summary:
    'Revenue is up 7.8% week-over-week, driven by strong performance in the Home & Kitchen category. However, 7 SKUs are at critical stockout risk, potentially impacting $18,400 in weekly revenue. Returning customer rate improved to 34.2%, suggesting recent retention efforts are working.',
  topIssues: [
    {
      id: 'issue-1',
      title: 'Premium Blender Pro reaching critical stock levels',
      severity: 'critical',
      category: 'Inventory',
    },
    {
      id: 'issue-2',
      title: 'Wireless Earbuds demand exceeding forecast by 40%',
      severity: 'high',
      category: 'Inventory',
    },
    {
      id: 'issue-3',
      title: 'Cart abandonment rate increased 12% in mobile checkout',
      severity: 'medium',
      category: 'Conversion',
    },
  ],
  topActions: [
    {
      id: 'action-1',
      title: 'Expedite reorder for Premium Blender Pro (SKU-1042)',
      impact: 'Prevent $8,200/week revenue loss',
      recommendationId: 'rec-1',
    },
    {
      id: 'action-2',
      title: 'Launch bundle promotion for slow-moving kitchen accessories',
      impact: 'Clear $12,000 excess inventory',
      recommendationId: 'rec-5',
    },
    {
      id: 'action-3',
      title: 'Review pricing on Organic Coffee Beans to match competitor drop',
      impact: 'Recover estimated 15% lost conversions',
      recommendationId: 'rec-8',
    },
  ],
  confidence: 'high',
  dataFreshness: '2 hours ago',
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
};

// =============================================================================
// Recommendations
// =============================================================================

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    type: 'stockout_risk',
    title: 'Expedite reorder for Premium Blender Pro',
    summary:
      'Current inventory will be depleted in 4 days based on 7-day velocity. This SKU contributes 6.4% of total revenue.',
    entity: 'SKU-1042',
    entityType: 'sku',
    priority: 'critical',
    priorityRank: 1,
    urgency: 'immediate',
    impactEstimate: '$8,200/week revenue at risk',
    impactValue: 8200,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    why: 'Sales velocity increased 45% over the past week while inventory has not been replenished. Current stock: 23 units. Daily velocity: 5.2 units.',
    evidence: [
      {
        type: 'sales_data',
        description: '7-day average: 5.2 units/day (up from 3.6 units/day)',
        data: { current: 5.2, previous: 3.6, change: 44.4 },
      },
      {
        type: 'inventory_level',
        description: 'Current stock: 23 units, Days remaining: 4.4',
        data: { stock: 23, daysRemaining: 4.4 },
      },
      {
        type: 'revenue_contribution',
        description: 'Revenue contribution: 6.4% of total store revenue',
        data: { contribution: 6.4 },
      },
    ],
    recommendedAction:
      'Place emergency reorder for 150 units. Consider air freight to minimize stockout duration.',
    relatedSignals: ['Trending on social media', 'Competitor out of stock'],
  },
  {
    id: 'rec-2',
    type: 'stockout_risk',
    title: 'Wireless Earbuds Pro approaching stockout',
    summary:
      'Demand spike detected. Current inventory will last approximately 6 days.',
    entity: 'SKU-2156',
    entityType: 'sku',
    priority: 'high',
    priorityRank: 2,
    urgency: 'this_week',
    impactEstimate: '$5,100/week revenue at risk',
    impactValue: 5100,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    why: 'A viral TikTok review drove 40% increase in demand. Current trajectory will exhaust stock before scheduled delivery.',
    evidence: [
      {
        type: 'sales_data',
        description: '7-day velocity increased 40% vs. 30-day average',
        data: { weeklyVelocity: 42, monthlyAvg: 30 },
      },
      {
        type: 'external_signal',
        description: 'TikTok video with 2.1M views featuring this product',
        data: { platform: 'tiktok', views: 2100000 },
      },
    ],
    recommendedAction:
      'Expedite pending order or source from alternate supplier.',
    relatedSignals: ['Social media trending', 'High add-to-cart rate'],
  },
  {
    id: 'rec-3',
    type: 'stockout_risk',
    title: 'Reorder Organic Coffee Beans - Medium Roast',
    summary: 'Stock will be depleted in 8 days at current velocity.',
    entity: 'SKU-3089',
    entityType: 'sku',
    priority: 'medium',
    priorityRank: 3,
    urgency: 'this_week',
    impactEstimate: '$3,400/week revenue at risk',
    impactValue: 3400,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    why: 'Consistent demand with typical lead time of 5 days. Order should be placed within 48 hours.',
    evidence: [
      {
        type: 'sales_data',
        description: 'Stable velocity: 8.5 units/day',
        data: { velocity: 8.5 },
      },
      {
        type: 'lead_time',
        description: 'Supplier lead time: 5 business days',
        data: { leadTimeDays: 5 },
      },
    ],
    recommendedAction: 'Place standard reorder for 200 units within 48 hours.',
    relatedSignals: [],
  },
  {
    id: 'rec-4',
    type: 'slow_mover',
    title: 'Clear slow-moving Vintage Desk Lamp inventory',
    summary:
      '340 days of inventory on hand. Consider markdown or bundle promotion.',
    entity: 'SKU-4521',
    entityType: 'sku',
    priority: 'medium',
    priorityRank: 4,
    urgency: 'this_month',
    impactEstimate: '$4,200 capital tied up',
    impactValue: 4200,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    why: 'Only 3 units sold in past 30 days with 34 units in stock. Product not gaining traction.',
    evidence: [
      {
        type: 'sales_data',
        description: '30-day sales: 3 units ($126)',
        data: { units: 3, revenue: 126 },
      },
      {
        type: 'inventory_level',
        description: 'Current inventory: 34 units, Days of supply: 340',
        data: { stock: 34, inventoryDays: 340 },
      },
    ],
    recommendedAction:
      'Apply 25% markdown or create bundle with complementary desk accessories.',
    relatedSignals: ['Below category average conversion rate'],
  },
  {
    id: 'rec-5',
    type: 'bundle_opportunity',
    title: 'Create Kitchen Starter Bundle',
    summary:
      'Frequently co-purchased items could be bundled for higher AOV and inventory clearance.',
    entity: 'Kitchen Accessories',
    entityType: 'product_category',
    priority: 'medium',
    priorityRank: 5,
    urgency: 'this_week',
    impactEstimate: '+$2,100/week revenue, clear excess inventory',
    impactValue: 2100,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    why: 'Analysis shows 67% of Premium Blender buyers also purchase silicone spatula set within 30 days. Bundling could capture this at point of sale.',
    evidence: [
      {
        type: 'purchase_pattern',
        description: '67% co-purchase rate within 30 days',
        data: { coPurchaseRate: 67 },
      },
      {
        type: 'inventory_level',
        description: 'Spatula set has 180 days inventory',
        data: { inventoryDays: 180 },
      },
    ],
    recommendedAction:
      'Create "Kitchen Starter Bundle" with 10% bundle discount. Feature on product pages.',
    relatedSignals: ['High cart add rate', 'Complementary product affinity'],
  },
  {
    id: 'rec-6',
    type: 'promotion_opportunity',
    title: 'Promote Yoga Mat Pro during fitness season',
    summary: 'Search volume trending up. Good inventory position to capitalize.',
    entity: 'SKU-5678',
    entityType: 'sku',
    priority: 'low',
    priorityRank: 6,
    urgency: 'this_week',
    impactEstimate: '+$1,800/week revenue potential',
    impactValue: 1800,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    why: 'Google Trends shows 35% increase in "yoga mat" searches. Your inventory can support increased demand.',
    evidence: [
      {
        type: 'search_trend',
        description: 'Google Trends: +35% search volume',
        data: { searchIncrease: 35 },
      },
      {
        type: 'inventory_level',
        description: 'Stock: 89 units, 45 days supply at current rate',
        data: { stock: 89, inventoryDays: 45 },
      },
    ],
    recommendedAction:
      'Feature in email campaign and homepage banner. Consider 10% limited-time discount.',
    relatedSignals: ['Seasonal trend', 'Adequate inventory'],
  },
  {
    id: 'rec-7',
    type: 'customer_retention',
    title: 'Win back lapsed coffee subscribers',
    summary: '142 coffee subscription customers have not ordered in 60+ days.',
    entity: 'Coffee Subscribers',
    entityType: 'customer_segment',
    priority: 'medium',
    priorityRank: 7,
    urgency: 'this_week',
    impactEstimate: '$4,800 potential monthly recovery',
    impactValue: 4800,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    why: 'These customers had average LTV of $340. Re-engagement campaigns typically see 15-20% win-back rate.',
    evidence: [
      {
        type: 'customer_data',
        description: '142 lapsed subscribers, avg LTV: $340',
        data: { count: 142, avgLTV: 340 },
      },
      {
        type: 'benchmark',
        description: 'Industry win-back rate: 15-20%',
        data: { benchmarkRate: { min: 15, max: 20 } },
      },
    ],
    recommendedAction:
      'Send personalized win-back email with 15% discount on next subscription order.',
    relatedSignals: ['High historic LTV segment', 'Subscription churn spike'],
  },
  {
    id: 'rec-8',
    type: 'pricing_adjustment',
    title: 'Review Organic Coffee Beans pricing',
    summary: 'Key competitor dropped price by 12%. Consider matching or differentiating.',
    entity: 'SKU-3089',
    entityType: 'sku',
    priority: 'medium',
    priorityRank: 8,
    urgency: 'this_week',
    impactEstimate: 'Prevent 15% conversion loss',
    impactValue: 1200,
    confidence: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    why: 'Competitor "CoffeeWorld" reduced price from $24.99 to $21.99. Your current price is $25.99.',
    evidence: [
      {
        type: 'competitive_intel',
        description: 'CoffeeWorld price: $21.99 (was $24.99)',
        data: { competitor: 'CoffeeWorld', newPrice: 21.99, oldPrice: 24.99 },
      },
      {
        type: 'conversion_data',
        description: 'Page views up 8%, conversions flat',
        data: { pageViewDelta: 8, conversionDelta: 0 },
      },
    ],
    recommendedAction:
      'Option A: Match at $22.99. Option B: Add value (free shipping, bonus sample).',
    relatedSignals: ['Competitor price change', 'Conversion rate decline'],
  },
  {
    id: 'rec-9',
    type: 'stockout_risk',
    title: 'Stainless Steel Water Bottle low stock alert',
    summary: 'Popular SKU has 9 days of inventory remaining.',
    entity: 'SKU-6234',
    entityType: 'sku',
    priority: 'medium',
    priorityRank: 9,
    urgency: 'this_week',
    impactEstimate: '$2,800/week revenue at risk',
    impactValue: 2800,
    confidence: 'high',
    status: 'accepted',
    createdAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    why: 'Standard reorder point reached. Order placed yesterday.',
    evidence: [
      {
        type: 'inventory_level',
        description: 'Stock: 45 units, 9 days remaining',
        data: { stock: 45, daysRemaining: 9 },
      },
    ],
    recommendedAction: 'Order placed - monitor delivery timeline.',
    relatedSignals: [],
  },
  {
    id: 'rec-10',
    type: 'slow_mover',
    title: 'Discontinue Ceramic Vase - Blue Pattern',
    summary: 'No sales in 45 days despite promotion attempts.',
    entity: 'SKU-7891',
    entityType: 'sku',
    priority: 'low',
    priorityRank: 10,
    urgency: 'this_month',
    impactEstimate: 'Recover $890 shelf space value',
    impactValue: 890,
    confidence: 'high',
    status: 'dismissed',
    createdAt: new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    why: 'Keeping for Q4 gift season evaluation.',
    evidence: [
      {
        type: 'sales_data',
        description: '45 days with zero sales',
        data: { daysSinceLastSale: 45 },
      },
    ],
    recommendedAction: 'Liquidate at 50% off or donate for tax benefit.',
    relatedSignals: [],
  },
  {
    id: 'rec-11',
    type: 'reorder_suggestion',
    title: 'Standard reorder: Premium Notebook Set',
    summary: 'Routine reorder based on steady demand patterns.',
    entity: 'SKU-8901',
    entityType: 'sku',
    priority: 'low',
    priorityRank: 11,
    urgency: 'this_month',
    impactEstimate: 'Maintain inventory health',
    impactValue: 0,
    confidence: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    why: 'Standard velocity product with predictable demand.',
    evidence: [
      {
        type: 'inventory_level',
        description: 'Stock: 67 units, 21 days remaining',
        data: { stock: 67, daysRemaining: 21 },
      },
    ],
    recommendedAction: 'Place standard reorder for 100 units.',
    relatedSignals: [],
  },
  {
    id: 'rec-12',
    type: 'promotion_opportunity',
    title: 'Cross-sell opportunity: Camera accessories',
    summary: 'Camera buyers rarely purchase accessories. Opportunity to increase AOV.',
    entity: 'Camera Accessories',
    entityType: 'product_category',
    priority: 'low',
    priorityRank: 12,
    urgency: 'this_month',
    impactEstimate: '+$1,200/week potential',
    impactValue: 1200,
    confidence: 'low',
    status: 'pending',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    why: 'Only 12% of camera buyers add accessories. Industry benchmark is 35%.',
    evidence: [
      {
        type: 'purchase_pattern',
        description: 'Accessory attach rate: 12% (benchmark: 35%)',
        data: { currentRate: 12, benchmark: 35 },
      },
    ],
    recommendedAction:
      'Add "Frequently bought together" section on camera product pages.',
    relatedSignals: ['Below benchmark attach rate'],
  },
];

// =============================================================================
// Trend Data
// =============================================================================

export const mockTrends: TrendData = {
  revenue: [
    { date: '2024-01-08', value: 16200 },
    { date: '2024-01-09', value: 17800 },
    { date: '2024-01-10', value: 19100 },
    { date: '2024-01-11', value: 18400 },
    { date: '2024-01-12', value: 21200 },
    { date: '2024-01-13', value: 16800 },
    { date: '2024-01-14', value: 17950 },
  ],
  orders: [
    { date: '2024-01-08', value: 42 },
    { date: '2024-01-09', value: 48 },
    { date: '2024-01-10', value: 51 },
    { date: '2024-01-11', value: 49 },
    { date: '2024-01-12', value: 58 },
    { date: '2024-01-13', value: 44 },
    { date: '2024-01-14', value: 50 },
  ],
  stockoutRisk: [
    { date: '2024-01-08', value: 3 },
    { date: '2024-01-09', value: 4 },
    { date: '2024-01-10', value: 4 },
    { date: '2024-01-11', value: 5 },
    { date: '2024-01-12', value: 6 },
    { date: '2024-01-13', value: 6 },
    { date: '2024-01-14', value: 7 },
  ],
};

// =============================================================================
// Daily Analysis
// =============================================================================

export const mockDailyAnalysis: DailyAnalysis = {
  date: new Date().toISOString(),
  kpis: mockKPIs,
  brief: mockBrief,
  trends: mockTrends,
  topRecommendations: mockRecommendations.slice(0, 5),
};

// =============================================================================
// Inventory Analysis
// =============================================================================

const mockStockoutRisks: InventorySKU[] = [
  {
    sku: 'SKU-1042',
    productName: 'Premium Blender Pro',
    inventoryOnHand: 23,
    velocity7Day: 5.2,
    velocity30Day: 4.1,
    daysRemaining: 4,
    revenueContribution: 6.4,
    riskClass: 'critical',
    estimatedRevenueAtRisk: 8200,
  },
  {
    sku: 'SKU-2156',
    productName: 'Wireless Earbuds Pro',
    inventoryOnHand: 38,
    velocity7Day: 6.0,
    velocity30Day: 4.3,
    daysRemaining: 6,
    revenueContribution: 4.0,
    riskClass: 'critical',
    estimatedRevenueAtRisk: 5100,
  },
  {
    sku: 'SKU-3089',
    productName: 'Organic Coffee Beans - Medium Roast',
    inventoryOnHand: 68,
    velocity7Day: 8.5,
    velocity30Day: 7.8,
    daysRemaining: 8,
    revenueContribution: 2.7,
    riskClass: 'high',
    estimatedRevenueAtRisk: 3400,
  },
  {
    sku: 'SKU-6234',
    productName: 'Stainless Steel Water Bottle',
    inventoryOnHand: 45,
    velocity7Day: 5.0,
    velocity30Day: 4.8,
    daysRemaining: 9,
    revenueContribution: 2.2,
    riskClass: 'high',
    estimatedRevenueAtRisk: 2800,
  },
  {
    sku: 'SKU-4455',
    productName: 'Bamboo Cutting Board Set',
    inventoryOnHand: 52,
    velocity7Day: 4.3,
    velocity30Day: 3.9,
    daysRemaining: 12,
    revenueContribution: 1.8,
    riskClass: 'medium',
    estimatedRevenueAtRisk: 2100,
  },
  {
    sku: 'SKU-5567',
    productName: 'Aromatherapy Diffuser',
    inventoryOnHand: 34,
    velocity7Day: 2.4,
    velocity30Day: 2.1,
    daysRemaining: 14,
    revenueContribution: 1.5,
    riskClass: 'medium',
    estimatedRevenueAtRisk: 1400,
  },
  {
    sku: 'SKU-6678',
    productName: 'Fitness Resistance Bands',
    inventoryOnHand: 78,
    velocity7Day: 4.9,
    velocity30Day: 4.2,
    daysRemaining: 16,
    revenueContribution: 1.2,
    riskClass: 'low',
    estimatedRevenueAtRisk: 980,
  },
];

const mockSlowMovers: SlowMover[] = [
  {
    sku: 'SKU-4521',
    productName: 'Vintage Desk Lamp',
    inventoryOnHand: 34,
    unitsSold30Day: 3,
    inventoryDays: 340,
    revenue30Day: 126,
    recommendation: 'Apply 25% markdown or create bundle',
  },
  {
    sku: 'SKU-7891',
    productName: 'Ceramic Vase - Blue Pattern',
    inventoryOnHand: 28,
    unitsSold30Day: 0,
    inventoryDays: 999,
    revenue30Day: 0,
    recommendation: 'Liquidate at 50% off',
  },
  {
    sku: 'SKU-8234',
    productName: 'Decorative Wall Clock',
    inventoryOnHand: 19,
    unitsSold30Day: 2,
    inventoryDays: 285,
    revenue30Day: 78,
    recommendation: 'Feature in home decor promotion',
  },
  {
    sku: 'SKU-9123',
    productName: 'Leather Journal - Brown',
    inventoryOnHand: 45,
    unitsSold30Day: 4,
    inventoryDays: 337,
    revenue30Day: 92,
    recommendation: 'Bundle with pen set',
  },
  {
    sku: 'SKU-1234',
    productName: 'Glass Terrarium Kit',
    inventoryOnHand: 22,
    unitsSold30Day: 2,
    inventoryDays: 330,
    revenue30Day: 64,
    recommendation: 'Seasonal promotion opportunity',
  },
];

const mockPromotionCandidates: PromotionCandidate[] = [
  {
    sku: 'SKU-5678',
    productName: 'Yoga Mat Pro',
    trend: 'rising',
    inventoryHealth: 'adequate',
    revenue30Day: 4200,
    promotionScore: 92,
  },
  {
    sku: 'SKU-3456',
    productName: 'Wireless Phone Charger',
    trend: 'rising',
    inventoryHealth: 'adequate',
    revenue30Day: 3800,
    promotionScore: 88,
  },
  {
    sku: 'SKU-7890',
    productName: 'Smart Home Hub',
    trend: 'stable',
    inventoryHealth: 'overstocked',
    revenue30Day: 5600,
    promotionScore: 85,
  },
  {
    sku: 'SKU-2345',
    productName: 'Portable Bluetooth Speaker',
    trend: 'rising',
    inventoryHealth: 'adequate',
    revenue30Day: 2900,
    promotionScore: 82,
  },
  {
    sku: 'SKU-6789',
    productName: 'LED Desk Light',
    trend: 'stable',
    inventoryHealth: 'overstocked',
    revenue30Day: 1800,
    promotionScore: 78,
  },
];

export const mockInventoryAnalysis: InventoryAnalysis = {
  summary: {
    criticalStockoutSKUs: 2,
    estimatedRevenueAtRisk: 18400,
    slowMoversCount: 5,
    topPromotionCandidate: 'Yoga Mat Pro',
  },
  stockoutRisks: mockStockoutRisks,
  slowMovers: mockSlowMovers,
  promotionCandidates: mockPromotionCandidates,
};

// =============================================================================
// Customer Analysis
// =============================================================================

const mockCohortRetention: CohortRetention[] = [
  { cohort: 'Jul 2023', month0: 100, month1: 42, month2: 28, month3: 22, month4: 19, month5: 17, month6: 15 },
  { cohort: 'Aug 2023', month0: 100, month1: 45, month2: 31, month3: 24, month4: 21, month5: 18, month6: 0 },
  { cohort: 'Sep 2023', month0: 100, month1: 48, month2: 33, month3: 26, month4: 22, month5: 0, month6: 0 },
  { cohort: 'Oct 2023', month0: 100, month1: 44, month2: 30, month3: 24, month4: 0, month5: 0, month6: 0 },
  { cohort: 'Nov 2023', month0: 100, month1: 52, month2: 36, month3: 0, month4: 0, month5: 0, month6: 0 },
  { cohort: 'Dec 2023', month0: 100, month1: 38, month2: 0, month3: 0, month4: 0, month5: 0, month6: 0 },
];

export const mockCustomerAnalysis: CustomerAnalysis = {
  metrics: {
    returningCustomerRate: 34.2,
    repeatPurchaseRate: 28.6,
    avgDaysBetweenPurchases: 42,
    newCustomers30Day: 892,
    returningCustomers30Day: 463,
  },
  cohortRetention: mockCohortRetention,
  recommendations: mockRecommendations.filter((r) => r.type === 'customer_retention'),
};

// =============================================================================
// Opportunities & Root Causes
// =============================================================================

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    type: 'bundle',
    title: 'Kitchen Starter Bundle',
    description: 'High co-purchase affinity between blender and accessories',
    potentialImpact: 2100,
    confidence: 'medium',
  },
  {
    id: 'opp-2',
    type: 'promotion',
    title: 'Fitness Season Campaign',
    description: 'Capitalize on trending fitness product searches',
    potentialImpact: 1800,
    confidence: 'medium',
  },
  {
    id: 'opp-3',
    type: 'retention',
    title: 'Coffee Subscriber Win-back',
    description: 'Re-engage lapsed subscription customers',
    potentialImpact: 4800,
    confidence: 'medium',
  },
];

export const mockRootCauses: RootCause[] = [
  {
    id: 'rc-1',
    issue: 'Rising stockout risk across 7 SKUs',
    cause: 'Demand forecast model not capturing social media signals',
    evidence: ['2 viral TikTok videos', '40% demand spike', 'Forecast accuracy: 62%'],
    severity: 'high',
  },
  {
    id: 'rc-2',
    issue: 'Mobile cart abandonment up 12%',
    cause: 'Checkout flow requires too many steps on mobile',
    evidence: ['5-step checkout vs 3-step industry standard', 'Drop-off at payment step'],
    severity: 'medium',
  },
];

// =============================================================================
// Ask Response Generator
// =============================================================================

export function generateMockAskResponse(question: string): AskResponse {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('attention') || lowerQuestion.includes('today')) {
    return {
      answer:
        'Based on today\'s analysis, your top priority should be addressing the stockout risk for Premium Blender Pro (SKU-1042). With only 4 days of inventory remaining and contributing 6.4% of total revenue, this needs immediate attention. Secondary priorities include the Wireless Earbuds Pro stockout risk and reviewing mobile checkout abandonment which increased 12%.',
      structuredResponse: {
        directAnswer:
          'Focus on 3 critical items: 1) Reorder Premium Blender Pro (4 days stock), 2) Expedite Wireless Earbuds (6 days), 3) Review mobile checkout flow.',
        supportingEvidence: [
          {
            description: 'Premium Blender Pro: 23 units remaining, 5.2 units/day velocity',
            data: { sku: 'SKU-1042', stock: 23, velocity: 5.2, daysRemaining: 4 },
          },
          {
            description: 'Revenue at risk from stockouts: $13,300/week across top 2 SKUs',
            data: { totalAtRisk: 13300, skuCount: 2 },
          },
        ],
        relatedRecommendations: [
          { id: 'rec-1', title: 'Expedite reorder for Premium Blender Pro' },
          { id: 'rec-2', title: 'Wireless Earbuds Pro approaching stockout' },
        ],
        suggestedFollowUps: [
          'What is the reorder lead time for these products?',
          'Are there alternative suppliers available?',
          'Should we run a promotion before stock runs out?',
        ],
        context: {
          tablesUsed: ['inventory', 'sales', 'recommendations'],
          recommendationIds: ['rec-1', 'rec-2'],
          confidence: 'high',
        },
      },
    };
  }

  if (lowerQuestion.includes('revenue') && (lowerQuestion.includes('drop') || lowerQuestion.includes('decline'))) {
    return {
      answer:
        'Revenue has actually increased 7.8% week-over-week, reaching $127,450 compared to $118,200 last week. However, I notice you might be concerned about specific categories or days. Saturday saw a 10% dip due to a payment processing issue that lasted 2 hours. Additionally, the Home Decor category is down 15% as seasonal items are not moving.',
      structuredResponse: {
        directAnswer:
          'Overall revenue is up 7.8% WoW. The perceived decline may be related to Saturday\'s payment issue or Home Decor category underperformance (-15%).',
        supportingEvidence: [
          {
            description: 'Weekly revenue: $127,450 (up from $118,200)',
            data: { current: 127450, previous: 118200, change: 7.8 },
          },
          {
            description: 'Saturday payment outage: 2 hours, estimated $1,200 lost',
            data: { date: '2024-01-13', duration: '2 hours', impact: 1200 },
          },
          {
            description: 'Home Decor category: -15% WoW',
            data: { category: 'Home Decor', change: -15 },
          },
        ],
        relatedRecommendations: [
          { id: 'rec-4', title: 'Clear slow-moving Vintage Desk Lamp inventory' },
        ],
        suggestedFollowUps: [
          'Which products are driving the Home Decor decline?',
          'How did the payment issue affect conversion rates?',
          'What promotions could boost Home Decor sales?',
        ],
        context: {
          tablesUsed: ['sales', 'orders', 'incidents'],
          recommendationIds: ['rec-4'],
          confidence: 'high',
        },
      },
    };
  }

  if (lowerQuestion.includes('sku') && lowerQuestion.includes('risk')) {
    return {
      answer:
        'Currently 7 SKUs are at stockout risk, with 2 at critical levels. The most urgent are Premium Blender Pro (4 days) and Wireless Earbuds Pro (6 days), representing $13,300 in weekly revenue at risk. The remaining 5 SKUs have 8-16 days of stock and are being monitored for standard reorder.',
      structuredResponse: {
        directAnswer:
          '7 SKUs at risk: 2 critical (4-6 days), 2 high (8-9 days), 3 medium/low (12-16 days). Total revenue at risk: $24,980/week.',
        supportingEvidence: [
          {
            description: 'Critical: Premium Blender Pro - 4 days, $8,200/week at risk',
            data: { sku: 'SKU-1042', daysRemaining: 4, revenueAtRisk: 8200, riskClass: 'critical' },
          },
          {
            description: 'Critical: Wireless Earbuds Pro - 6 days, $5,100/week at risk',
            data: { sku: 'SKU-2156', daysRemaining: 6, revenueAtRisk: 5100, riskClass: 'critical' },
          },
          {
            description: 'High: Organic Coffee Beans - 8 days, $3,400/week at risk',
            data: { sku: 'SKU-3089', daysRemaining: 8, revenueAtRisk: 3400, riskClass: 'high' },
          },
        ],
        relatedRecommendations: [
          { id: 'rec-1', title: 'Expedite reorder for Premium Blender Pro' },
          { id: 'rec-2', title: 'Wireless Earbuds Pro approaching stockout' },
          { id: 'rec-3', title: 'Reorder Organic Coffee Beans - Medium Roast' },
        ],
        suggestedFollowUps: [
          'What is causing the demand spike for these items?',
          'Can we expedite any pending orders?',
          'Should we limit purchase quantities to extend stock?',
        ],
        context: {
          tablesUsed: ['inventory', 'sales_velocity', 'purchase_orders'],
          recommendationIds: ['rec-1', 'rec-2', 'rec-3'],
          confidence: 'high',
        },
      },
    };
  }

  // Default response for other questions
  return {
    answer:
      'I\'ve analyzed your question against the current store data. Based on recent performance, revenue is up 7.8% WoW with 342 orders. The main areas requiring attention are inventory management (7 SKUs at stockout risk) and customer retention (34.2% returning customer rate). Would you like me to dive deeper into any specific area?',
    structuredResponse: {
      directAnswer:
        'Store is performing well overall with revenue up 7.8%. Main focus areas: inventory (7 SKUs at risk) and retention opportunities.',
      supportingEvidence: [
        {
          description: 'Weekly performance summary',
          data: { revenue: 127450, orders: 342, aov: 372.66 },
        },
      ],
      relatedRecommendations: [
        { id: 'rec-1', title: 'Expedite reorder for Premium Blender Pro' },
        { id: 'rec-5', title: 'Create Kitchen Starter Bundle' },
      ],
      suggestedFollowUps: [
        'What needs attention today?',
        'Which SKUs are at risk?',
        'How is customer retention trending?',
      ],
      context: {
        tablesUsed: ['sales', 'inventory', 'customers'],
        recommendationIds: ['rec-1', 'rec-5'],
        confidence: 'medium',
      },
    },
  };
}

// =============================================================================
// Simulation Result Generator
// =============================================================================

export function generateMockSimulationResult(
  type: 'stockout' | 'reorder' | 'discount' | 'bundle'
): SimulationResult {
  const baseResult: SimulationResult = {
    id: `sim-${Date.now()}`,
    type,
    runAt: new Date().toISOString(),
    input: { type, parameters: {} },
    outcome: {
      revenue: 0,
      revenueDelta: 0,
      units: 0,
      margin: 0,
      marginDelta: 0,
    },
    assumptions: [],
    confidence: 'medium',
  };

  switch (type) {
    case 'stockout':
      return {
        ...baseResult,
        outcome: {
          revenue: 118200,
          revenueDelta: -8200,
          units: 298,
          margin: 42100,
          marginDelta: -2900,
        },
        assumptions: [
          'Based on current 7-day velocity trends',
          'No substitute products available',
          '60% of customers will not wait for restock',
          'Lead time: 5 business days',
        ],
        confidence: 'high',
      };

    case 'reorder':
      return {
        ...baseResult,
        outcome: {
          revenue: 127450,
          revenueDelta: 0,
          units: 342,
          margin: 45500,
          marginDelta: -800, // Expedite shipping cost
        },
        assumptions: [
          'Expedited shipping available at $800 premium',
          'Stock arrives before sellout',
          'No demand change during period',
        ],
        confidence: 'high',
      };

    case 'discount':
      return {
        ...baseResult,
        outcome: {
          revenue: 132800,
          revenueDelta: 5350,
          units: 412,
          margin: 44200,
          marginDelta: -1300,
        },
        assumptions: [
          '15% discount on slow-moving items',
          'Elasticity coefficient: 1.8 for this category',
          'Promotion duration: 7 days',
          'No cannibalization of full-price items',
        ],
        confidence: 'medium',
      };

    case 'bundle':
      return {
        ...baseResult,
        outcome: {
          revenue: 129600,
          revenueDelta: 2150,
          units: 358,
          margin: 46800,
          marginDelta: 1300,
        },
        assumptions: [
          '10% bundle discount',
          '25% of blender buyers will choose bundle',
          'Marginal cost savings on shipping',
          'Clears excess accessory inventory',
        ],
        confidence: 'medium',
      };

    default:
      return baseResult;
  }
}
