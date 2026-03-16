'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecommendationFilters } from '@/components/filters';
import { RecommendationDetailPanel } from '@/components/cards';
import { cn, formatRelativeTime } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Recommendation, PriorityLevel, RecommendationType, RecommendationStatus, ConfidenceLevel } from '@/lib/types';

const priorityStyles: Record<PriorityLevel, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const statusStyles: Record<RecommendationStatus, string> = {
  pending: 'status-pending',
  accepted: 'status-accepted',
  dismissed: 'status-dismissed',
  in_progress: 'status-in-progress',
};

const typeLabels: Record<RecommendationType, string> = {
  stockout_risk: 'Stockout Risk',
  slow_mover: 'Slow Mover',
  promotion_opportunity: 'Promotion',
  pricing_adjustment: 'Pricing',
  customer_retention: 'Retention',
  bundle_opportunity: 'Bundle',
  reorder_suggestion: 'Reorder',
};

const urgencyLabels: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Immediate', color: 'text-red-600' },
  this_week: { label: 'This Week', color: 'text-orange-600' },
  this_month: { label: 'This Month', color: 'text-yellow-600' },
  low: { label: 'Low', color: 'text-slate-600' },
};

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'confidence-high',
  medium: 'confidence-medium',
  low: 'confidence-low',
};

interface FilterState {
  status: RecommendationStatus[];
  type: RecommendationType[];
  priority: PriorityLevel[];
}

function ActionQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    type: [],
    priority: [],
  });

  const selectedRecommendation = useMemo(
    () => recommendations.find((r) => r.id === selectedId),
    [recommendations, selectedId]
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.recommendations.list({
          status: filters.status.length > 0 ? filters.status : undefined,
          type: filters.type.length > 0 ? filters.type : undefined,
          priority: filters.priority.length > 0 ? filters.priority : undefined,
        });
        setRecommendations(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]);

  const handleRowClick = (rec: Recommendation) => {
    router.push(`/action-queue?id=${rec.id}`);
  };

  const handleClosePanel = () => {
    router.push('/action-queue');
  };

  const handleAccept = async (id: string) => {
    try {
      await api.recommendations.updateStatus(id, 'accepted');
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'accepted' as const } : r))
      );
      handleClosePanel();
    } catch (err) {
      console.error('Failed to accept recommendation:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.recommendations.updateStatus(id, 'dismissed');
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'dismissed' as const } : r))
      );
      handleClosePanel();
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
    }
  };

  const handleSimulate = (id: string) => {
    router.push(`/simulations?recommendation=${id}`);
  };

  // Summary stats
  const stats = useMemo(() => {
    const pending = recommendations.filter((r) => r.status === 'pending').length;
    const critical = recommendations.filter(
      (r) => r.priority === 'critical' && r.status === 'pending'
    ).length;
    const accepted = recommendations.filter((r) => r.status === 'accepted').length;
    const totalImpact = recommendations
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + (r.impactValue || 0), 0);
    return { pending, critical, accepted, totalImpact };
  }, [recommendations]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-sm text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Action Queue"
        subtitle="Prioritized recommendations requiring attention"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pending</p>
                  <p className="text-2xl font-semibold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Critical</p>
                  <p className="text-2xl font-semibold">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Accepted</p>
                  <p className="text-2xl font-semibold">{stats.accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <AlertTriangle className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Impact at Risk</p>
                  <p className="text-2xl font-semibold">
                    ${stats.totalImpact.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <RecommendationFilters filters={filters} onChange={setFilters} />
          </CardContent>
        </Card>

        {/* Recommendations Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              {recommendations.length} Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border bg-slate-50">
                    <th className="table-header px-4 py-3 text-left">#</th>
                    <th className="table-header px-4 py-3 text-left">Recommendation</th>
                    <th className="table-header px-4 py-3 text-left">Type</th>
                    <th className="table-header px-4 py-3 text-left">Entity</th>
                    <th className="table-header px-4 py-3 text-left">Impact</th>
                    <th className="table-header px-4 py-3 text-center">Urgency</th>
                    <th className="table-header px-4 py-3 text-center">Confidence</th>
                    <th className="table-header px-4 py-3 text-left">Created</th>
                    <th className="table-header px-4 py-3 text-center">Status</th>
                    <th className="table-header px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec) => (
                    <tr
                      key={rec.id}
                      onClick={() => handleRowClick(rec)}
                      className={cn(
                        'table-row cursor-pointer',
                        selectedId === rec.id && 'bg-brand-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <Badge className={priorityStyles[rec.priority]}>
                          {rec.priorityRank}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900 max-w-xs truncate">
                          {rec.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">{typeLabels[rec.type]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{rec.entity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{rec.impactEstimate}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-xs font-medium', urgencyLabels[rec.urgency].color)}>
                          {urgencyLabels[rec.urgency].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-xs font-medium capitalize', confidenceStyles[rec.confidence])}>
                          {rec.confidence}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(rec.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn('capitalize', statusStyles[rec.status])}>
                          {rec.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArrowRight className="inline-block h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      {selectedRecommendation && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={handleClosePanel}
          />
          <RecommendationDetailPanel
            recommendation={selectedRecommendation}
            onClose={handleClosePanel}
            onAccept={handleAccept}
            onDismiss={handleDismiss}
            onSimulate={handleSimulate}
          />
        </>
      )}
    </div>
  );
}

export default function ActionQueuePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
      <ActionQueueContent />
    </Suspense>
  );
}
