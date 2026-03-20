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

const urgencyColors: Record<string, string> = {
  immediate: 'var(--cartex-danger)',
  this_week: 'var(--cartex-ember)',
  this_month: 'var(--cartex-warning)',
  low: 'var(--cartex-muted)',
};

const urgencyLabels: Record<string, string> = {
  immediate: 'Immediate',
  this_week: 'This Week',
  this_month: 'This Month',
  low: 'Low',
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent mx-auto" style={{ borderColor: 'var(--cartex-teal)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--cartex-muted)' }}>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto" style={{ color: 'var(--cartex-danger)' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--cartex-text)' }}>{error}</p>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-warning) 20%, transparent)' }}>
                  <Clock className="h-5 w-5" style={{ color: 'var(--cartex-warning)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Pending</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-text)' }}>{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-danger) 20%, transparent)' }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: 'var(--cartex-danger)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Critical</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-text)' }}>{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-success) 20%, transparent)' }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--cartex-success)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Accepted</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-text)' }}>{stats.accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--cartex-teal) 20%, transparent)' }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: 'var(--cartex-teal)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--cartex-muted)' }}>Impact at Risk</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--cartex-text)' }}>
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
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--cartex-muted)' }}>
              {recommendations.length} Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--cartex-border)', backgroundColor: 'var(--cartex-surface)' }}>
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
                      className="cursor-pointer transition-colors hover:bg-[var(--cartex-surface)]"
                      style={{
                        borderBottom: '1px solid var(--cartex-border)',
                        backgroundColor: selectedId === rec.id ? 'var(--cartex-surface)' : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <Badge className={priorityStyles[rec.priority]}>
                          {rec.priorityRank}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium max-w-xs truncate" style={{ color: 'var(--cartex-text)' }}>
                          {rec.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--cartex-muted)' }}>{typeLabels[rec.type]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--cartex-tertiary)' }}>{rec.entity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>{rec.impactEstimate}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium" style={{ color: urgencyColors[rec.urgency] }}>
                          {urgencyLabels[rec.urgency]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-xs font-medium capitalize', confidenceStyles[rec.confidence])}>
                          {rec.confidence}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--cartex-tertiary)' }}>
                          {formatRelativeTime(rec.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn('capitalize', statusStyles[rec.status])}>
                          {rec.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArrowRight className="inline-block h-4 w-4" style={{ color: 'var(--cartex-muted)' }} />
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--cartex-teal)', borderTopColor: 'transparent' }} /></div>}>
      <ActionQueueContent />
    </Suspense>
  );
}
