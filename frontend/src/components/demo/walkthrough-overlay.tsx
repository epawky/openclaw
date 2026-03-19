'use client';

// =============================================================================
// Walkthrough Overlay Component
// =============================================================================
// Provides step-by-step guided walkthrough for demos and presentations.
// Shows current step info, navigation controls, and presenter notes.
// =============================================================================

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  X,
  PlayCircle,
  MessageSquare,
  Target,
  Clock,
} from 'lucide-react';
import { useDemo } from '@/lib/demo/context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WalkthroughOverlay() {
  const router = useRouter();
  const {
    state,
    currentWalkthroughStep,
    walkthroughProgress,
    nextStep,
    prevStep,
    endWalkthrough,
    completeStep,
    totalSteps,
  } = useDemo();

  // Don't render if walkthrough is not active
  if (!state.walkthroughActive || !currentWalkthroughStep) {
    return null;
  }

  const step = currentWalkthroughStep;
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === totalSteps - 1;

  const handleNext = () => {
    completeStep(step.id);
    if (isLastStep) {
      endWalkthrough();
    } else {
      nextStep();
      // Navigate to next step's target page
      const nextStepIndex = state.currentStep + 1;
      const nextStepData = totalSteps > nextStepIndex ? currentWalkthroughStep : null;
      if (nextStepData?.targetPage) {
        router.push(nextStepData.targetPage);
      }
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const navigateToStep = () => {
    if (step.targetPage) {
      router.push(step.targetPage);
    }
  };

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${walkthroughProgress}%` }}
        />
      </div>

      {/* Walkthrough panel */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-semibold text-sm">
                {step.step}
              </div>
              <span className="text-xs text-slate-500">
                Step {step.step} of {totalSteps}
              </span>
            </div>
            <button
              onClick={endWalkthrough}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{step.description}</p>

            {/* Suggested action */}
            {step.suggestedAction && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 p-3">
                <Target className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-700">{step.suggestedAction}</p>
              </div>
            )}

            {/* Presenter notes - smaller and collapsible for cleaner look */}
            <details className="mt-3 group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs text-slate-400 hover:text-slate-600">
                <MessageSquare className="h-3.5 w-3.5" />
                Presenter Notes
              </summary>
              <div className="mt-2 rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">{step.presenterNotes}</p>
              </div>
            </details>

            {/* Duration indicator */}
            {step.duration && (
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                ~{Math.floor(step.duration / 60)}:{(step.duration % 60).toString().padStart(2, '0')} min
              </div>
            )}
          </div>

          {/* Footer with navigation */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={navigateToStep}
              className="gap-1"
            >
              <PlayCircle className="h-4 w-4" />
              Go to Page
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Step Indicator Dots (for sidebar or minimal view)
// =============================================================================

export function WalkthroughStepIndicator() {
  const { state, goToStep, totalSteps } = useDemo();

  if (!state.walkthroughActive) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <button
          key={index}
          onClick={() => goToStep(index)}
          className={cn(
            'h-2 w-2 rounded-full transition-all',
            index === state.currentStep
              ? 'bg-brand-500 w-4'
              : index < state.currentStep
              ? 'bg-brand-300'
              : 'bg-slate-300'
          )}
        />
      ))}
    </div>
  );
}
