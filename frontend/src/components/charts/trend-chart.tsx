'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TrendDataPoint } from '@/lib/types';

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  dataKey?: string;
  color?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

export function TrendChart({
  title,
  data,
  dataKey = 'value',
  color = '#6366f1',
  valueFormatter = formatNumber,
  height = 200,
}: TrendChartProps) {
  const formattedData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={formattedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={valueFormatter}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [valueFormatter(value), title]}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Revenue-specific chart
interface RevenueTrendChartProps {
  data: TrendDataPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <TrendChart
      title="Revenue Trend"
      data={data}
      color="#10b981"
      valueFormatter={(v) => formatCurrency(v, 'USD', 'en-US').replace('.00', '')}
    />
  );
}

// Orders-specific chart
interface OrdersTrendChartProps {
  data: TrendDataPoint[];
}

export function OrdersTrendChart({ data }: OrdersTrendChartProps) {
  return (
    <TrendChart title="Orders Trend" data={data} color="#6366f1" valueFormatter={formatNumber} />
  );
}

// Stockout risk trend chart
interface StockoutRiskTrendChartProps {
  data: TrendDataPoint[];
}

export function StockoutRiskTrendChart({ data }: StockoutRiskTrendChartProps) {
  return (
    <TrendChart
      title="SKUs at Stockout Risk"
      data={data}
      color="#f59e0b"
      valueFormatter={(v) => `${v} SKUs`}
    />
  );
}
