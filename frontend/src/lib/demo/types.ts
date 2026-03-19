// =============================================================================
// Demo Mode Types
// =============================================================================

export interface DemoScenario {
  id: string;
  title: string;
  summary: string;
  category: 'revenue' | 'inventory' | 'customers' | 'operations';
  severity: 'critical' | 'warning' | 'info' | 'success';
  highlightTarget?: string;
  linkedRecommendationId?: string;
}

export interface WalkthroughStep {
  id: string;
  step: number;
  title: string;
  description: string;
  presenterNotes: string;
  targetPage: string;
  highlightTarget?: string;
  suggestedAction?: string;
  duration?: number; // estimated seconds
}

export interface DemoState {
  isActive: boolean;
  walkthroughActive: boolean;
  currentStep: number;
  completedSteps: string[];
  sessionStarted?: string;
}

export interface DemoConfig {
  companyName: string;
  industry: string;
  scenarios: DemoScenario[];
  walkthroughSteps: WalkthroughStep[];
}

export type DemoAction =
  | { type: 'START_DEMO' }
  | { type: 'END_DEMO' }
  | { type: 'START_WALKTHROUGH' }
  | { type: 'END_WALKTHROUGH' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'COMPLETE_STEP'; stepId: string }
  | { type: 'RESET_DEMO' };
