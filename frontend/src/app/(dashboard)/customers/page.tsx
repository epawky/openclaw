'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Users, Repeat, Calendar, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendationsTable } from '@/components/tables';
import { api } from '@/lib/api';
import { formatPercent, formatNumber } from '@/lib/utils';
import type { CustomerAnalysis, Recommendation } from '@/lib/types';

// Cohort Retention Chart Component
function CohortRetentionChart({ data }: { data: CustomerAnalysis['cohortRetention'] }) {
  const getCellStyle = (value: number): React.CSSProperties => {
    if (value >= 40) return { background: '#10b981', color: '#ffffff' }; // emerald-500
    if (value >= 25) return { background: '#34d399', color: '#064e3b' }; // emerald-400 with dark text
    if (value >= 15) return { background: '#fbbf24', color: '#78350f' }; // amber-400 with dark text
    if (value > 0) return { background: '#f97316', color: '#ffffff' }; // orange-500
    return { background: 'var(--cartex-surface)', color: 'var(--cartex-muted)' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--cartex-text)' }}>
          Cohort Retention Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cartex-border)' }}>
                <th className="py-2 text-left font-medium" style={{ color: 'var(--cartex-muted)' }}>Cohort</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 0</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 1</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 2</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 3</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 4</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 5</th>
                <th className="py-2 text-center font-medium" style={{ color: 'var(--cartex-muted)' }}>Month 6</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.cohort} style={{ borderBottom: '1px solid var(--cartex-border)' }}>
                  <td className="py-2 font-medium" style={{ color: 'var(--cartex-text)' }}>{row.cohort}</td>
                  {[row.month0, row.month1, row.month2, row.month3, row.month4, row.month5, row.month6].map(
                    (value, idx) => (
                      <td key={idx} className="py-2 text-center">
                        {value > 0 ? (
                          <span
                            className="inline-flex items-center justify-center w-12 h-8 rounded text-xs font-semibold"
                            style={getCellStyle(value)}
                          >
                            {value}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--cartex-muted)' }}>-</span>
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--cartex-muted)' }}>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: '#10b981' }} />
            <span>40%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: '#34d399' }} />
            <span>25-40%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: '#fbbf24' }} />
            <span>15-25%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: '#f97316' }} />
            <span>&lt;15%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CustomerAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.customers.getAnalysis();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading customer analysis...</p>
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

  const { metrics, cohortRetention, recommendations } = analysis;

  return (
    <div className="min-h-screen">
      <Header
        title="Customers"
        subtitle="Retention metrics and customer behavior analysis"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
      />

      <div className="p-4 space-y-4 lg:p-6 lg:space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <Users className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Returning Rate</p>
                  <p className="text-2xl font-semibold text-brand-600">
                    {formatPercent(metrics.returningCustomerRate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Repeat className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Repeat Purchase</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatPercent(metrics.repeatPurchaseRate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg Days Between</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {formatNumber(metrics.avgDaysBetweenPurchases)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">New (30d)</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {formatNumber(metrics.newCustomers30Day)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Returning (30d)</p>
                  <p className="text-2xl font-semibold text-purple-600">
                    {formatNumber(metrics.returningCustomers30Day)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Retention Chart */}
        <CohortRetentionChart data={cohortRetention} />

        {/* Retention Recommendations */}
        {recommendations.length > 0 && (
          <RecommendationsTable
            recommendations={recommendations}
            onRowClick={handleRecommendationClick}
            showStatus={true}
          />
        )}
      </div>
    </div>
  );
}
