'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { InventorySKU, RiskClass } from '@/lib/types';

interface RiskBarChartProps {
  data: InventorySKU[];
  height?: number;
}

const riskColors: Record<RiskClass, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  healthy: '#22c55e',
};

export function RiskBarChart({ data, height = 300 }: RiskBarChartProps) {
  const chartData = data
    .sort((a, b) => b.estimatedRevenueAtRisk - a.estimatedRevenueAtRisk)
    .slice(0, 7)
    .map((item) => ({
      name: item.productName.length > 20 ? item.productName.slice(0, 20) + '...' : item.productName,
      fullName: item.productName,
      sku: item.sku,
      value: item.estimatedRevenueAtRisk,
      riskClass: item.riskClass,
      daysRemaining: item.daysRemaining,
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-cartex-muted">
          Revenue at Risk by SKU
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--cartex-border)]" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="fill-[var(--cartex-muted)]"
              tickFormatter={(v) => formatCurrency(v).replace('.00', '')}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="fill-[var(--cartex-muted)]"
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--cartex-card)',
                border: '1px solid var(--cartex-border)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: 'var(--cartex-text)',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue at Risk']}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${data.fullName} (${data.sku}) - ${data.daysRemaining} days remaining`;
                }
                return '';
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={riskColors[entry.riskClass]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
