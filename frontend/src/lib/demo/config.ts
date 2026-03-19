// =============================================================================
// Demo Mode Configuration
// =============================================================================

import type { DemoScenario, WalkthroughStep, DemoConfig } from './types';

// =============================================================================
// Demo Scenarios - The "story" moments that showcase AI COO value
// =============================================================================

export const demoScenarios: DemoScenario[] = [
  {
    id: 'scenario-revenue-decline',
    title: 'Revenue Decline Detected',
    summary: 'Weekly revenue is down 12% compared to the same period last month. The AI has identified contributing factors and recommended actions.',
    category: 'revenue',
    severity: 'critical',
    highlightTarget: 'kpi-revenue',
    linkedRecommendationId: 'rec-promo-ribeye',
  },
  {
    id: 'scenario-stockout-brisket',
    title: 'Brisket Bundle Stockout Risk',
    summary: 'Your best-selling Brisket Bundle (40% of revenue) will stock out in 4 days at current velocity. Expedited reorder recommended.',
    category: 'inventory',
    severity: 'critical',
    highlightTarget: 'inventory-stockout',
    linkedRecommendationId: 'rec-reorder-brisket',
  },
  {
    id: 'scenario-slow-mover',
    title: 'Pork Sampler Slow Mover',
    summary: 'Pork Sampler Box has 45 days of inventory but only 8 days until expiry concerns. 15% discount could move 60% of stock.',
    category: 'inventory',
    severity: 'warning',
    highlightTarget: 'inventory-slow-mover',
    linkedRecommendationId: 'rec-discount-pork',
  },
  {
    id: 'scenario-retention-drop',
    title: 'Retention Weakening',
    summary: 'March 2024 cohort retention dropped to 18% (vs 32% benchmark). AI suggests targeted win-back campaign.',
    category: 'customers',
    severity: 'warning',
    highlightTarget: 'customer-retention',
    linkedRecommendationId: 'rec-retention-march',
  },
  {
    id: 'scenario-bundle-opportunity',
    title: 'Bundle Opportunity Detected',
    summary: 'Customers who buy Ribeye Box often buy Steak Seasoning Set. Creating a bundle could increase AOV by $24.',
    category: 'operations',
    severity: 'info',
    highlightTarget: 'recommendations-bundle',
    linkedRecommendationId: 'rec-bundle-ribeye-seasoning',
  },
];

// =============================================================================
// Walkthrough Steps - Guided tour for demos and investor presentations
// =============================================================================

export const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'step-overview',
    step: 1,
    title: 'Executive Overview',
    description: 'The dashboard shows your store\'s health at a glance. The AI has already analyzed your data and surfaced what matters most.',
    presenterNotes: 'Point out the KPI cards showing revenue decline. Mention that the AI runs continuously, not just when you ask.',
    targetPage: '/overview',
    highlightTarget: 'kpi-section',
    suggestedAction: 'Notice the red indicators - the AI has flagged issues requiring attention.',
    duration: 60,
  },
  {
    id: 'step-action-queue',
    step: 2,
    title: 'Prioritized Action Queue',
    description: 'Every recommendation is ranked by urgency and potential impact. The AI explains WHY each action matters.',
    presenterNotes: 'Click on the Brisket Bundle stockout alert. Show how it explains the 4-day runway and $12K daily revenue at risk.',
    targetPage: '/action-queue',
    highlightTarget: 'action-queue-table',
    suggestedAction: 'Click on the critical stockout alert to see the AI\'s detailed analysis.',
    duration: 90,
  },
  {
    id: 'step-inventory',
    step: 3,
    title: 'Inventory Intelligence',
    description: 'Real-time inventory analysis with stockout predictions, slow-mover identification, and reorder recommendations.',
    presenterNotes: 'Show the inventory grid. Point out how it combines velocity data with supplier lead times to predict stockouts accurately.',
    targetPage: '/inventory',
    highlightTarget: 'inventory-grid',
    suggestedAction: 'Explore the SKU details to see days-of-supply calculations.',
    duration: 75,
  },
  {
    id: 'step-ask-coo',
    step: 4,
    title: 'Ask Your AI COO',
    description: 'Ask natural language questions about your business. The AI has full context of your store data.',
    presenterNotes: 'Try asking "Why is revenue down this week?" or "What should I do about the Pork Sampler inventory?"',
    targetPage: '/ask',
    highlightTarget: 'chat-input',
    suggestedAction: 'Try asking: "What\'s my biggest risk right now?"',
    duration: 120,
  },
  {
    id: 'step-simulations',
    step: 5,
    title: 'What-If Simulations',
    description: 'Test decisions before making them. See projected outcomes for reorders, discounts, and bundles.',
    presenterNotes: 'Run a simulation for the Brisket Bundle reorder. Show how it calculates ROI including expedited shipping costs.',
    targetPage: '/simulations',
    highlightTarget: 'simulation-form',
    suggestedAction: 'Run a stockout simulation to see the projected revenue impact.',
    duration: 90,
  },
];

// =============================================================================
// Demo Configuration
// =============================================================================

export const demoConfig: DemoConfig = {
  companyName: 'Prairie Prime Meats',
  industry: 'Premium Meat E-commerce',
  scenarios: demoScenarios,
  walkthroughSteps: walkthroughSteps,
};

// =============================================================================
// Suggested Ask COO Prompts for Demo Mode
// =============================================================================

export const demoAskPrompts = [
  {
    category: 'urgent',
    prompts: [
      "What's my biggest risk right now?",
      "Why is revenue down this week?",
      "What should I do about the Brisket Bundle?",
    ],
  },
  {
    category: 'inventory',
    prompts: [
      "Which products will stock out soon?",
      "What should I do about slow-moving inventory?",
      "Should I expedite the brisket reorder?",
    ],
  },
  {
    category: 'customers',
    prompts: [
      "Why is customer retention dropping?",
      "Which customer cohort needs attention?",
      "How can I improve repeat purchase rate?",
    ],
  },
  {
    category: 'strategy',
    prompts: [
      "What bundle opportunities exist?",
      "Should I run a promotion on ribeye?",
      "How can I increase average order value?",
    ],
  },
];

// =============================================================================
// Demo Mode Environment Check
// =============================================================================

export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};
