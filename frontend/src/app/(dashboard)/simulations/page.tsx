'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Package,
  Percent,
  Layers,
  PlayCircle,
  Check,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import type { SimulationResult, SimulationType, ConfidenceLevel } from '@/lib/types';

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

interface SimulationFormProps {
  type: SimulationType;
  onSubmit: (params: Record<string, unknown>) => void;
  loading: boolean;
}

function StockoutSimForm({ onSubmit, loading }: Omit<SimulationFormProps, 'type'>) {
  const [sku, setSku] = useState('SKU-1042');
  const [daysToStockout, setDaysToStockout] = useState(4);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
        <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g., SKU-1042" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Days to Stockout</label>
        <Input
          type="number"
          value={daysToStockout}
          onChange={(e) => setDaysToStockout(parseInt(e.target.value) || 0)}
        />
      </div>
      <Button onClick={() => onSubmit({ sku, daysToStockout })} disabled={loading} className="w-full">
        <PlayCircle className="h-4 w-4 mr-2" />
        {loading ? 'Running Simulation...' : 'Run Stockout Simulation'}
      </Button>
    </div>
  );
}

function ReorderSimForm({ onSubmit, loading }: Omit<SimulationFormProps, 'type'>) {
  const [sku, setSku] = useState('SKU-1042');
  const [quantity, setQuantity] = useState(150);
  const [expedite, setExpedite] = useState(true);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
        <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g., SKU-1042" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="expedite"
          checked={expedite}
          onChange={(e) => setExpedite(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="expedite" className="text-sm text-slate-700">
          Expedite shipping (+$800)
        </label>
      </div>
      <Button onClick={() => onSubmit({ sku, quantity, expedite })} disabled={loading} className="w-full">
        <PlayCircle className="h-4 w-4 mr-2" />
        {loading ? 'Running Simulation...' : 'Run Reorder Simulation'}
      </Button>
    </div>
  );
}

function DiscountSimForm({ onSubmit, loading }: Omit<SimulationFormProps, 'type'>) {
  const [sku, setSku] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [durationDays, setDurationDays] = useState(7);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">SKU (leave empty for category)</label>
        <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g., SKU-4521" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label>
        <Input
          type="number"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Duration (days)</label>
        <Input
          type="number"
          value={durationDays}
          onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
        />
      </div>
      <Button onClick={() => onSubmit({ sku, discountPercent, durationDays })} disabled={loading} className="w-full">
        <PlayCircle className="h-4 w-4 mr-2" />
        {loading ? 'Running Simulation...' : 'Run Discount Simulation'}
      </Button>
    </div>
  );
}

function BundleSimForm({ onSubmit, loading }: Omit<SimulationFormProps, 'type'>) {
  const [primarySku, setPrimarySku] = useState('SKU-1042');
  const [bundledSkus, setBundledSkus] = useState('SKU-5567');
  const [bundleDiscount, setBundleDiscount] = useState(10);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Primary SKU</label>
        <Input value={primarySku} onChange={(e) => setPrimarySku(e.target.value)} placeholder="e.g., SKU-1042" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Bundled SKUs (comma separated)</label>
        <Input
          value={bundledSkus}
          onChange={(e) => setBundledSkus(e.target.value)}
          placeholder="e.g., SKU-5567, SKU-5568"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Bundle Discount %</label>
        <Input
          type="number"
          value={bundleDiscount}
          onChange={(e) => setBundleDiscount(parseInt(e.target.value) || 0)}
        />
      </div>
      <Button
        onClick={() => onSubmit({ primarySku, bundledSkus: bundledSkus.split(',').map((s) => s.trim()), bundleDiscount })}
        disabled={loading}
        className="w-full"
      >
        <PlayCircle className="h-4 w-4 mr-2" />
        {loading ? 'Running Simulation...' : 'Run Bundle Simulation'}
      </Button>
    </div>
  );
}

function SimulationResultCard({ result }: { result: SimulationResult }) {
  const { outcome, assumptions, confidence, type } = result;
  const isPositive = outcome.revenueDelta >= 0;

  return (
    <Card className="border-2 border-brand-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold capitalize">
            {type} Simulation Result
          </CardTitle>
          <Badge className={confidenceColors[confidence]}>{confidence} confidence</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outcome Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Projected Revenue</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(outcome.revenue)}</p>
            <div className={cn('flex items-center gap-1 text-sm', isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {formatCurrency(Math.abs(outcome.revenueDelta))}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Projected Margin</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(outcome.margin)}</p>
            <div
              className={cn(
                'flex items-center gap-1 text-sm',
                outcome.marginDelta >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {outcome.marginDelta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {formatCurrency(Math.abs(outcome.marginDelta))}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Projected Units</p>
            <p className="text-lg font-semibold text-slate-900">{outcome.units}</p>
          </div>
        </div>

        {/* Assumptions */}
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Assumptions
          </p>
          <ul className="space-y-1">
            {assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                {assumption}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function SimulationsContent() {
  const searchParams = useSearchParams();
  const recommendationId = searchParams.get('recommendation');

  const [activeTab, setActiveTab] = useState<SimulationType>(recommendationId ? 'stockout' : 'stockout');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async (type: SimulationType, params: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.simulate(type, { type, parameters: params });
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Simulations"
        subtitle="Test scenarios before taking action"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Simulation Forms */}
          <div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SimulationType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="stockout" className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Stockout
                </TabsTrigger>
                <TabsTrigger value="reorder" className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  Reorder
                </TabsTrigger>
                <TabsTrigger value="discount" className="flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5" />
                  Discount
                </TabsTrigger>
                <TabsTrigger value="bundle" className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  Bundle
                </TabsTrigger>
              </TabsList>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Simulation Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TabsContent value="stockout" className="mt-0">
                    <StockoutSimForm
                      onSubmit={(params) => handleRunSimulation('stockout', params)}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="reorder" className="mt-0">
                    <ReorderSimForm
                      onSubmit={(params) => handleRunSimulation('reorder', params)}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="discount" className="mt-0">
                    <DiscountSimForm
                      onSubmit={(params) => handleRunSimulation('discount', params)}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="bundle" className="mt-0">
                    <BundleSimForm
                      onSubmit={(params) => handleRunSimulation('bundle', params)}
                      loading={loading}
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          {/* Results */}
          <div>
            {loading && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-4" />
                    <p className="text-sm text-slate-500">Running simulation...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <X className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800">Simulation Failed</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && <SimulationResultCard result={result} />}

            {!loading && !error && !result && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <PlayCircle className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-sm text-slate-500">
                      Configure a simulation on the left and click run to see projected outcomes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Saved Simulations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Saved Simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 text-center py-8">
              No saved simulations yet. Run a simulation and save it for future reference.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SimulationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
      <SimulationsContent />
    </Suspense>
  );
}
