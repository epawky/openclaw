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

const trendIcons = {
  rising: <TrendingUp className="h-4 w-4 text-green-500" />,
  stable: <Minus className="h-4 w-4 text-slate-400" />,
  declining: <TrendingDown className="h-4 w-4 text-red-500" />,
};

const trendLabels = {
  rising: 'Rising',
  stable: 'Stable',
  declining: 'Declining',
};

const inventoryHealthStyles: Record<string, string> = {
  overstocked: 'bg-orange-100 text-orange-800',
  adequate: 'bg-green-100 text-green-800',
  low: 'bg-red-100 text-red-800',
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
        <CardTitle className="text-sm font-medium text-slate-600">
          Promotion Candidates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-slate-50">
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
                    'table-row',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-600">{item.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900 max-w-xs truncate block">
                      {item.productName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {trendIcons[item.trend]}
                      <span className="text-xs text-slate-600">{trendLabels[item.trend]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={inventoryHealthStyles[item.inventoryHealth]}>
                      {inventoryHealthLabels[item.inventoryHealth]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-600">
                      {formatCurrency(item.revenue30Day)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            item.promotionScore >= 80 && 'bg-green-500',
                            item.promotionScore >= 60 && item.promotionScore < 80 && 'bg-yellow-500',
                            item.promotionScore < 60 && 'bg-slate-400'
                          )}
                          style={{ width: `${item.promotionScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-8">
                        {item.promotionScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onRowClick && (
                      <ArrowRight className="inline-block h-4 w-4 text-slate-400" />
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
