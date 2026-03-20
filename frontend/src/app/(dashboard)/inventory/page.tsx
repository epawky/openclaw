'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Package, DollarSign, TrendingUp, Tag } from 'lucide-react';
import { Header } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockoutRiskTable, SlowMoversTable, PromotionCandidatesTable } from '@/components/tables';
import { RiskBarChart, VelocityScatterChart } from '@/components/charts';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { InventoryAnalysis, InventorySKU } from '@/lib/types';

export default function InventoryPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<InventoryAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('stockout');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.inventory.getAnalysis();
        setAnalysis(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStockoutClick = (sku: InventorySKU) => {
    // Navigate to action queue with filter for this SKU
    router.push(`/action-queue?entity=${sku.sku}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent mx-auto" style={{ borderColor: 'var(--cartex-teal)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--cartex-muted)' }}>Loading inventory analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto" style={{ color: 'var(--cartex-danger)' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--cartex-text)' }}>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const { summary, stockoutRisks, slowMovers, promotionCandidates } = analysis;

  return (
    <div className="min-h-screen">
      <Header
        title="Inventory"
        subtitle="Stockout risk, dead stock, and promotion opportunities"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
      />

      <div className="p-4 space-y-4 lg:p-6 lg:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-danger) 20%, transparent)' }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: 'var(--cartex-danger)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Critical SKUs</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-danger)' }}>
                    {summary.criticalStockoutSKUs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-ember) 20%, transparent)' }}>
                  <DollarSign className="h-5 w-5" style={{ color: 'var(--cartex-ember)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Revenue at Risk</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-ember)' }}>
                    {formatCurrency(summary.estimatedRevenueAtRisk)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-warning) 20%, transparent)' }}>
                  <Package className="h-5 w-5" style={{ color: 'var(--cartex-warning)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Slow Movers</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-warning)' }}>
                    {summary.slowMoversCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-success) 20%, transparent)' }}>
                  <Tag className="h-5 w-5" style={{ color: 'var(--cartex-success)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Top Promotion</p>
                  <p className="text-lg font-semibold truncate max-w-[150px]" style={{ color: 'var(--cartex-success)' }}>
                    {summary.topPromotionCandidate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RiskBarChart data={stockoutRisks} height={280} />
          <VelocityScatterChart data={slowMovers} height={280} />
        </div>

        {/* Tabbed Tables */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="stockout" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stockout Risk ({stockoutRisks.length})
            </TabsTrigger>
            <TabsTrigger value="slow" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Slow Movers ({slowMovers.length})
            </TabsTrigger>
            <TabsTrigger value="promotion" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Promotion Candidates ({promotionCandidates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stockout">
            <StockoutRiskTable data={stockoutRisks} onRowClick={handleStockoutClick} />
          </TabsContent>

          <TabsContent value="slow">
            <SlowMoversTable data={slowMovers} />
          </TabsContent>

          <TabsContent value="promotion">
            <PromotionCandidatesTable data={promotionCandidates} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
