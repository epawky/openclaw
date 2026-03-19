'use client';

import React, { useEffect, useState } from 'react';
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

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  dataKey?: string;
  colorVar?: string;
  colorFallback?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

export function TrendChart({
  title,
  data,
  dataKey = 'value',
  colorVar = '--cartex-teal',
  colorFallback = '#00E5BF',
  valueFormatter = formatNumber,
  height = 200,
}: TrendChartProps) {
  const color = useCssVar(colorVar, colorFallback);
  const borderColor = useCssVar('--cartex-border', '#2A3A52');
  const mutedColor = useCssVar('--cartex-muted', '#A8BBCF');
  const cardColor = useCssVar('--cartex-card', '#141C2E');
  const textColor = useCssVar('--cartex-text', '#F5F8FF');

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
        <CardTitle className="text-sm font-medium text-cartex-muted">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={formattedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: mutedColor }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: mutedColor }}
              tickFormatter={valueFormatter}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: cardColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: textColor,
              }}
              formatter={(value: number) => [valueFormatter(value), title]}
              labelStyle={{ color: mutedColor, marginBottom: '4px' }}
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
      colorVar="--cartex-success"
      colorFallback="#00F0A0"
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
    <TrendChart
      title="Orders Trend"
      data={data}
      colorVar="--cartex-info"
      colorFallback="#6EB5FF"
      valueFormatter={formatNumber}
    />
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
      colorVar="--cartex-warning"
      colorFallback="#FFD040"
      valueFormatter={(v) => `${v} SKUs`}
    />
  );
}
