'use client';

// =============================================================================
// Demo Mode Badge Component
// =============================================================================
// Visual indicator that demo mode is active, with controls to start
// walkthrough or reset demo data.
// =============================================================================

import React, { useState } from 'react';
import {
  PlayCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { useDemo } from '@/lib/demo/context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DemoBadge() {
  const {
    isDemoMode,
    state,
    startWalkthrough,
    resetDemo,
    companyName,
  } = useDemo();
  const [expanded, setExpanded] = useState(false);

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className={cn(
          'rounded-lg border bg-white shadow-lg transition-all duration-200',
          expanded ? 'w-72' : 'w-auto'
        )}
      >
        {/* Badge header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-brand-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Demo Mode</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-slate-100 p-3">
            {/* Company info */}
            <div className="mb-3 rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Demo Company</p>
              <p className="font-medium text-slate-700">{companyName}</p>
            </div>

            {/* Info text */}
            <div className="mb-3 flex items-start gap-2 text-xs text-slate-500">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <p>You&apos;re viewing demo data. All changes are temporary and will reset.</p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {!state.walkthroughActive && (
                <Button
                  onClick={startWalkthrough}
                  size="sm"
                  className="w-full gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Guided Tour
                </Button>
              )}
              <Button
                onClick={resetDemo}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Demo Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Compact Demo Indicator (for header integration)
// =============================================================================

export function DemoIndicator() {
  const { isDemoMode, startWalkthrough, resetDemo, state, companyName } = useDemo();
  const [open, setOpen] = useState(false);

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-100 to-brand-100 px-3 py-1 hover:from-purple-200 hover:to-brand-200 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
        <span className="text-xs font-medium text-purple-700">Demo</span>
        <ChevronDown className={cn("h-3 w-3 text-purple-600 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border bg-cartex-card border-cartex shadow-lg">
            {/* Company info */}
            <div className="p-3 border-b border-cartex">
              <p className="text-xs text-cartex-muted">Demo Company</p>
              <p className="font-medium text-cartex">{companyName}</p>
            </div>

            {/* Info text */}
            <div className="p-3 border-b border-cartex">
              <div className="flex items-start gap-2 text-xs text-cartex-muted">
                <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <p>You&apos;re viewing demo data. All changes are temporary.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 space-y-2">
              {!state.walkthroughActive && (
                <Button
                  onClick={() => {
                    startWalkthrough();
                    setOpen(false);
                  }}
                  size="sm"
                  className="w-full gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Guided Tour
                </Button>
              )}
              <Button
                onClick={() => {
                  resetDemo();
                  setOpen(false);
                }}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Demo Data
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
