// =============================================================================
// Demo Mode - Barrel Export
// =============================================================================

// Types
export type {
  DemoScenario,
  WalkthroughStep,
  DemoState,
  DemoConfig,
  DemoAction,
} from './types';

// Configuration
export {
  demoConfig,
  demoScenarios,
  walkthroughSteps,
  demoAskPrompts,
  isDemoMode,
} from './config';

// Data
export {
  demoData,
  demoCompanyInfo,
  demoKPIs,
  demoBrief,
  demoRecommendations,
  demoInventoryAnalysis,
  demoCustomerAnalysis,
  demoTrends,
  demoSimulationResults,
  demoAskResponses,
} from './data';

// Context
export {
  DemoProvider,
  useDemo,
  useDemoOptional,
} from './context';
