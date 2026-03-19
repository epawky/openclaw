'use client';

// =============================================================================
// Demo Mode Context Provider
// =============================================================================
// Manages demo state including walkthrough progress, active scenarios,
// and demo mode UI state.
// =============================================================================

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { DemoState, DemoAction, DemoScenario, WalkthroughStep } from './types';
import { demoConfig, isDemoMode, walkthroughSteps, demoScenarios } from './config';

// =============================================================================
// Initial State
// =============================================================================

const initialState: DemoState = {
  isActive: false,
  walkthroughActive: false,
  currentStep: 0,
  completedSteps: [],
  sessionStarted: undefined,
};

// =============================================================================
// Reducer
// =============================================================================

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'START_DEMO':
      return {
        ...state,
        isActive: true,
        sessionStarted: new Date().toISOString(),
      };

    case 'END_DEMO':
      return {
        ...state,
        isActive: false,
        walkthroughActive: false,
        sessionStarted: undefined,
      };

    case 'START_WALKTHROUGH':
      return {
        ...state,
        walkthroughActive: true,
        currentStep: 0,
        completedSteps: [],
      };

    case 'END_WALKTHROUGH':
      return {
        ...state,
        walkthroughActive: false,
      };

    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, walkthroughSteps.length - 1);
      return {
        ...state,
        currentStep: nextStep,
      };

    case 'PREV_STEP':
      const prevStep = Math.max(state.currentStep - 1, 0);
      return {
        ...state,
        currentStep: prevStep,
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.step, walkthroughSteps.length - 1)),
      };

    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.stepId)) {
        return state;
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.stepId],
      };

    case 'RESET_DEMO':
      return {
        ...initialState,
        isActive: isDemoMode(),
      };

    default:
      return state;
  }
}

// =============================================================================
// Context Type
// =============================================================================

interface DemoContextType {
  // State
  state: DemoState;
  isDemoMode: boolean;

  // Walkthrough
  currentWalkthroughStep: WalkthroughStep | null;
  walkthroughProgress: number;

  // Scenarios
  scenarios: DemoScenario[];
  getScenarioById: (id: string) => DemoScenario | undefined;

  // Actions
  startDemo: () => void;
  endDemo: () => void;
  startWalkthrough: () => void;
  endWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  resetDemo: () => void;

  // Config
  companyName: string;
  totalSteps: number;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

interface DemoProviderProps {
  children: React.ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [state, dispatch] = useReducer(demoReducer, {
    ...initialState,
    isActive: isDemoMode(),
  });

  // Auto-start demo mode if env flag is set
  useEffect(() => {
    if (isDemoMode() && !state.isActive) {
      dispatch({ type: 'START_DEMO' });
    }
  }, [state.isActive]);

  // Actions
  const startDemo = useCallback(() => dispatch({ type: 'START_DEMO' }), []);
  const endDemo = useCallback(() => dispatch({ type: 'END_DEMO' }), []);
  const startWalkthrough = useCallback(() => dispatch({ type: 'START_WALKTHROUGH' }), []);
  const endWalkthrough = useCallback(() => dispatch({ type: 'END_WALKTHROUGH' }), []);
  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const goToStep = useCallback((step: number) => dispatch({ type: 'GO_TO_STEP', step }), []);
  const completeStep = useCallback((stepId: string) => dispatch({ type: 'COMPLETE_STEP', stepId }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), []);

  // Derived state
  const currentWalkthroughStep = state.walkthroughActive
    ? walkthroughSteps[state.currentStep] || null
    : null;

  const walkthroughProgress = walkthroughSteps.length > 0
    ? ((state.currentStep + 1) / walkthroughSteps.length) * 100
    : 0;

  const getScenarioById = useCallback(
    (id: string) => demoScenarios.find((s) => s.id === id),
    []
  );

  const value: DemoContextType = {
    state,
    isDemoMode: state.isActive,
    currentWalkthroughStep,
    walkthroughProgress,
    scenarios: demoScenarios,
    getScenarioById,
    startDemo,
    endDemo,
    startWalkthrough,
    endWalkthrough,
    nextStep,
    prevStep,
    goToStep,
    completeStep,
    resetDemo,
    companyName: demoConfig.companyName,
    totalSteps: walkthroughSteps.length,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useDemo(): DemoContextType {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// =============================================================================
// Optional Hook (doesn't throw if not in provider)
// =============================================================================

export function useDemoOptional(): DemoContextType | null {
  const context = useContext(DemoContext);
  return context ?? null;
}
