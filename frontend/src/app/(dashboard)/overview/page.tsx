'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { Header, type DateRange } from '@/components/layout';
import { KPICard, BriefCard } from '@/components/cards';
import { RevenueTrendChart, OrdersTrendChart, StockoutRiskTrendChart } from '@/components/charts';
import { RecommendationsTable } from '@/components/tables';
import { DemoScenariosGrid } from '@/components/demo';
import { api } from '@/lib/api';
import type { DailyAnalysis, Recommendation, KPIData } from '@/lib/types';

// Helper to format date range labels
const dateRangeLabels: Record<DateRange, string> = {
  today: 'Today',
  '7d': '7d',
  '30d': '30d',
  '90d': '90d',
  custom: '',
};

export default function OverviewPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch KPIs when date range changes
  const fetchKPIs = useCallback(async (period: DateRange) => {
    try {
      const response = await api.analysis.getKPIs(period);
      setKpis(response.data);
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.analysis.getToday();
        setAnalysis(response.data);
        setKpis(response.data.kpis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle date range changes
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    fetchKPIs(range);
  }, [fetchKPIs]);

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

  const { brief, trends, topRecommendations } = analysis;
  const displayKpis = kpis || analysis.kpis;
  const periodLabel = dateRangeLabels[dateRange];

  return (
    <div className="min-h-screen">
      <Header
        title="Overview"
        subtitle="What needs attention right now?"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            title={`Revenue (${periodLabel})`}
            value={displayKpis.revenue}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <KPICard
            title={`Orders (${periodLabel})`}
            value={displayKpis.orders}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <KPICard
            title="AOV"
            value={displayKpis.aov}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Returning Rate"
            value={displayKpis.returningCustomerRate}
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard
            title="SKUs at Risk"
            value={displayKpis.skusAtRisk}
            icon={<AlertTriangle className="h-5 w-5" />}
            onClick={() => router.push('/inventory')}
          />
          <KPICard
            title="Open Actions"
            value={displayKpis.openRecommendations}
            icon={<ClipboardList className="h-5 w-5" />}
            onClick={() => router.push('/action-queue')}
          />
        </div>

        {/* AI COO Brief + Trend Charts + Demo Scenarios */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BriefCard
              brief={brief}
              onActionClick={handleActionClick}
              onIssueClick={(issueId) => console.log('Issue clicked:', issueId)}
            />
            {/* Demo Scenarios - only shows when NEXT_PUBLIC_DEMO_MODE=true */}
            <DemoScenariosGrid />
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
