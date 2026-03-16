'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatNumber, formatDaysRemaining } from '@/lib/utils';
import type { InventorySKU, RiskClass } from '@/lib/types';

interface StockoutRiskTableProps {
  data: InventorySKU[];
  onRowClick?: (sku: InventorySKU) => void;
}

const riskStyles: Record<RiskClass, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  healthy: 'bg-green-100 text-green-800',
};

const riskLabels: Record<RiskClass, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  healthy: 'Healthy',
};

export function StockoutRiskTable({ data, onRowClick }: StockoutRiskTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600">
          Stockout Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-slate-50">
                <th className="table-header px-4 py-3 text-left">SKU</th>
                <th className="table-header px-4 py-3 text-left">Product</th>
                <th className="table-header px-4 py-3 text-right">On Hand</th>
                <th className="table-header px-4 py-3 text-right">7d Velocity</th>
                <th className="table-header px-4 py-3 text-right">30d Velocity</th>
                <th className="table-header px-4 py-3 text-right">Days Left</th>
                <th className="table-header px-4 py-3 text-right">Rev %</th>
                <th className="table-header px-4 py-3 text-center">Risk</th>
                <th className="table-header px-4 py-3 text-right">$ at Risk</th>
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
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {formatNumber(item.inventoryOnHand)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-600">
                      {item.velocity7Day.toFixed(1)}/day
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-600">
                      {item.velocity30Day.toFixed(1)}/day
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.daysRemaining <= 7 && 'text-red-600',
                        item.daysRemaining > 7 && item.daysRemaining <= 14 && 'text-orange-600',
                        item.daysRemaining > 14 && 'text-slate-600'
                      )}
                    >
                      {formatDaysRemaining(item.daysRemaining)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-600">
                      {item.revenueContribution.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={riskStyles[item.riskClass]}>
                      {riskLabels[item.riskClass]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(item.estimatedRevenueAtRisk)}
                    </span>
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
