'use client';

import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { PromotionCandidate } from '@/lib/types';

interface PromotionCandidatesTableProps {
  data: PromotionCandidate[];
  onRowClick?: (item: PromotionCandidate) => void;
}

const trendColors = {
  rising: 'var(--cartex-success)',
  stable: 'var(--cartex-muted)',
  declining: 'var(--cartex-danger)',
};

const trendLabels = {
  rising: 'Rising',
  stable: 'Stable',
  declining: 'Declining',
};

const inventoryHealthColors: Record<string, { bg: string; text: string }> = {
  overstocked: { bg: 'color-mix(in srgb, var(--cartex-ember) 20%, transparent)', text: 'var(--cartex-ember)' },
  adequate: { bg: 'color-mix(in srgb, var(--cartex-success) 20%, transparent)', text: 'var(--cartex-success)' },
  low: { bg: 'color-mix(in srgb, var(--cartex-danger) 20%, transparent)', text: 'var(--cartex-danger)' },
};

const inventoryHealthLabels: Record<string, string> = {
  overstocked: 'Overstocked',
  adequate: 'Adequate',
  low: 'Low',
};

export function PromotionCandidatesTable({ data, onRowClick }: PromotionCandidatesTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--cartex-muted)' }}>
          Promotion Candidates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cartex-border)', backgroundColor: 'var(--cartex-surface)' }}>
                <th className="table-header px-4 py-3 text-left">SKU</th>
                <th className="table-header px-4 py-3 text-left">Product</th>
                <th className="table-header px-4 py-3 text-center">Trend</th>
                <th className="table-header px-4 py-3 text-center">Inventory</th>
                <th className="table-header px-4 py-3 text-right">30d Revenue</th>
                <th className="table-header px-4 py-3 text-right">Score</th>
                <th className="table-header px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.sku}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'transition-colors hover:bg-[var(--cartex-surface)]',
                    onRowClick && 'cursor-pointer'
                  )}
                  style={{ borderBottom: '1px solid var(--cartex-border)' }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs" style={{ color: 'var(--cartex-muted)' }}>{item.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm max-w-xs truncate block" style={{ color: 'var(--cartex-text)' }}>
                      {item.productName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.trend === 'rising' && <TrendingUp className="h-4 w-4" style={{ color: trendColors.rising }} />}
                      {item.trend === 'stable' && <Minus className="h-4 w-4" style={{ color: trendColors.stable }} />}
                      {item.trend === 'declining' && <TrendingDown className="h-4 w-4" style={{ color: trendColors.declining }} />}
                      <span className="text-xs" style={{ color: 'var(--cartex-muted)' }}>{trendLabels[item.trend]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge style={{ backgroundColor: inventoryHealthColors[item.inventoryHealth].bg, color: inventoryHealthColors[item.inventoryHealth].text }}>
                      {inventoryHealthLabels[item.inventoryHealth]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>
                      {formatCurrency(item.revenue30Day)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cartex-surface)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.promotionScore}%`,
                            backgroundColor: item.promotionScore >= 80
                              ? 'var(--cartex-success)'
                              : item.promotionScore >= 60
                              ? 'var(--cartex-warning)'
                              : 'var(--cartex-muted)'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8" style={{ color: 'var(--cartex-text)' }}>
                        {item.promotionScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onRowClick && (
                      <ArrowRight className="inline-block h-4 w-4" style={{ color: 'var(--cartex-muted)' }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
