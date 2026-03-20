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

const riskColors: Record<RiskClass, { bg: string; text: string }> = {
  critical: { bg: 'color-mix(in srgb, var(--cartex-danger) 20%, transparent)', text: 'var(--cartex-danger)' },
  high: { bg: 'color-mix(in srgb, var(--cartex-ember) 20%, transparent)', text: 'var(--cartex-ember)' },
  medium: { bg: 'color-mix(in srgb, var(--cartex-warning) 20%, transparent)', text: 'var(--cartex-warning)' },
  low: { bg: 'color-mix(in srgb, var(--cartex-info) 20%, transparent)', text: 'var(--cartex-info)' },
  healthy: { bg: 'color-mix(in srgb, var(--cartex-success) 20%, transparent)', text: 'var(--cartex-success)' },
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
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--cartex-muted)' }}>
          Stockout Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cartex-border)', backgroundColor: 'var(--cartex-surface)' }}>
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
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium" style={{ color: 'var(--cartex-text)' }}>
                      {formatNumber(item.inventoryOnHand)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>
                      {item.velocity7Day.toFixed(1)}/day
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>
                      {item.velocity30Day.toFixed(1)}/day
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: item.daysRemaining <= 7
                          ? 'var(--cartex-danger)'
                          : item.daysRemaining <= 14
                          ? 'var(--cartex-ember)'
                          : 'var(--cartex-muted)'
                      }}
                    >
                      {formatDaysRemaining(item.daysRemaining)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>
                      {item.revenueContribution.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge style={{ backgroundColor: riskColors[item.riskClass].bg, color: riskColors[item.riskClass].text }}>
                      {riskLabels[item.riskClass]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium" style={{ color: 'var(--cartex-danger)' }}>
                      {formatCurrency(item.estimatedRevenueAtRisk)}
                    </span>
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
