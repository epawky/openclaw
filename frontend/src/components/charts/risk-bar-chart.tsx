'use client';

import React, { useEffect, useState } from 'react';
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

// Hook to get CSS variable value
function useCssVar(varName: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const updateValue = () => {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      setValue(computed || fallback);
    };

    updateValue();

    // Listen for theme changes
    const observer = new MutationObserver(updateValue);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [varName, fallback]);

  return value;
}

interface RiskBarChartProps {
  data: InventorySKU[];
  height?: number;
}

const riskColors: Record<RiskClass, string> = {
  critical: '#FF5C72',
  high: '#FF7A45',
  medium: '#FFD040',
  low: '#6EB5FF',
  healthy: '#00F0A0',
};

export function RiskBarChart({ data, height = 300 }: RiskBarChartProps) {
  const borderColor = useCssVar('--cartex-border', '#2A3A52');
  const mutedColor = useCssVar('--cartex-muted', '#A8BBCF');
  const cardColor = useCssVar('--cartex-card', '#141C2E');
  const textColor = useCssVar('--cartex-text', '#F5F8FF');

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
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} horizontal={true} vertical={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: mutedColor }}
              tickFormatter={(v) => formatCurrency(v).replace('.00', '')}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: mutedColor }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: cardColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: textColor,
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
