'use client';

// =============================================================================
// Demo Scenarios Component
// =============================================================================
// Shows the key demo moments/scenarios as clickable cards that highlight
// specific product value propositions.
// =============================================================================

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  TrendingDown,
  Package,
  Users,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { useDemo } from '@/lib/demo/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DemoScenario } from '@/lib/demo/types';

// =============================================================================
// Scenario Icon Mapping
// =============================================================================

const categoryIcons = {
  revenue: TrendingDown,
  inventory: Package,
  customers: Users,
  operations: Lightbulb,
};

const severityStyles = {
  critical: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50',
  success: 'border-green-200 bg-green-50',
};

const severityIconStyles = {
  critical: 'bg-red-100 text-red-600',
  warning: 'bg-yellow-100 text-yellow-600',
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
};

// =============================================================================
// Single Scenario Card
// =============================================================================

interface ScenarioCardProps {
  scenario: DemoScenario;
  onClick?: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const Icon = categoryIcons[scenario.category];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
        severityStyles[scenario.severity]
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
            severityIconStyles[scenario.severity]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900">{scenario.title}</h4>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {scenario.summary}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </div>
    </button>
  );
}

// =============================================================================
// Demo Scenarios Grid
// =============================================================================

export function DemoScenariosGrid() {
  const router = useRouter();
  const { scenarios, isDemoMode } = useDemo();

  if (!isDemoMode) {
    return null;
  }

  const handleScenarioClick = (scenario: DemoScenario) => {
    // Navigate to relevant page based on scenario
    if (scenario.linkedRecommendationId) {
      router.push(`/action-queue?id=${scenario.linkedRecommendationId}`);
    } else if (scenario.category === 'inventory') {
      router.push('/inventory');
    } else if (scenario.category === 'customers') {
      router.push('/customers');
    } else {
      router.push('/overview');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <AlertTriangle className="h-4 w-4" />
          Key Scenarios to Explore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onClick={() => handleScenarioClick(scenario)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Mini Scenario List (for sidebar)
// =============================================================================

export function DemoScenariosList() {
  const router = useRouter();
  const { scenarios, isDemoMode } = useDemo();

  if (!isDemoMode) {
    return null;
  }

  const handleScenarioClick = (scenario: DemoScenario) => {
    if (scenario.linkedRecommendationId) {
      router.push(`/action-queue?id=${scenario.linkedRecommendationId}`);
    }
  };

  // Show only critical/warning scenarios
  const urgentScenarios = scenarios.filter(
    (s) => s.severity === 'critical' || s.severity === 'warning'
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Demo Scenarios
      </p>
      {urgentScenarios.map((scenario) => {
        const Icon = categoryIcons[scenario.category];
        return (
          <button
            key={scenario.id}
            onClick={() => handleScenarioClick(scenario)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs transition-colors',
              scenario.severity === 'critical'
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            )}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{scenario.title}</span>
          </button>
        );
      })}
    </div>
  );
}
