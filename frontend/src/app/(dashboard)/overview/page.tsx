'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { Header } from '@/components/layout';
import { KPICard, BriefCard } from '@/components/cards';
import { RevenueTrendChart, OrdersTrendChart, StockoutRiskTrendChart } from '@/components/charts';
import { RecommendationsTable } from '@/components/tables';
import { api } from '@/lib/api';
import type { DailyAnalysis, Recommendation } from '@/lib/types';

export default function OverviewPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.analysis.getToday();
        setAnalysis(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRecommendationClick = (rec: Recommendation) => {
    router.push(`/action-queue?id=${rec.id}`);
  };

  const handleActionClick = (recommendationId: string) => {
    router.push(`/action-queue?id=${recommendationId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-sm text-slate-700">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const { kpis, brief, trends, topRecommendations } = analysis;

  return (
    <div className="min-h-screen">
      <Header
        title="Overview"
        subtitle="What needs attention right now?"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            title="Revenue (7d)"
            value={kpis.revenue}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <KPICard
            title="Orders (7d)"
            value={kpis.orders}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <KPICard
            title="AOV"
            value={kpis.aov}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Returning Rate"
            value={kpis.returningCustomerRate}
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard
            title="SKUs at Risk"
            value={kpis.skusAtRisk}
            icon={<AlertTriangle className="h-5 w-5" />}
            onClick={() => router.push('/inventory')}
          />
          <KPICard
            title="Open Actions"
            value={kpis.openRecommendations}
            icon={<ClipboardList className="h-5 w-5" />}
            onClick={() => router.push('/action-queue')}
          />
        </div>

        {/* AI COO Brief + Trend Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BriefCard
              brief={brief}
              onActionClick={handleActionClick}
              onIssueClick={(issueId) => console.log('Issue clicked:', issueId)}
            />
          </div>

          <div className="space-y-4">
            <RevenueTrendChart data={trends.revenue} />
            <OrdersTrendChart data={trends.orders} />
            <StockoutRiskTrendChart data={trends.stockoutRisk} />
          </div>
        </div>

        {/* Top Recommendations Table */}
        <RecommendationsTable
          recommendations={topRecommendations}
          onRowClick={handleRecommendationClick}
          showStatus={true}
        />
      </div>
    </div>
  );
}
