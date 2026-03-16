'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import type { SlowMover, RiskClass } from '@/lib/types';

interface VelocityScatterChartProps {
  data: SlowMover[];
  height?: number;
}

const getInventoryHealthColor = (inventoryDays: number): string => {
  if (inventoryDays > 200) return '#ef4444'; // Red - excess
  if (inventoryDays > 90) return '#f97316'; // Orange - high
  if (inventoryDays > 45) return '#eab308'; // Yellow - medium
  return '#22c55e'; // Green - healthy
};

export function VelocityScatterChart({ data, height = 300 }: VelocityScatterChartProps) {
  const chartData = data.map((item) => ({
    x: item.unitsSold30Day,
    y: item.inventoryDays,
    z: item.inventoryOnHand,
    name: item.productName,
    sku: item.sku,
    recommendation: item.recommendation,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          Velocity vs Inventory Days
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              name="30-Day Sales"
              unit=" units"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: '30-Day Sales (units)',
                position: 'bottom',
                offset: 0,
                style: { fontSize: 11, fill: '#64748b' },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Inventory Days"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Inventory Days',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 11, fill: '#64748b' },
              }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === '30-Day Sales') return [`${formatNumber(value)} units`, name];
                if (name === 'Inventory Days') return [`${formatNumber(value)} days`, name];
                return [formatNumber(value), name];
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${data.name} (${data.sku})`;
                }
                return '';
              }}
            />
            <Scatter data={chartData} fill="#6366f1">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getInventoryHealthColor(entry.y)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-slate-600">Healthy (&lt;45d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="text-slate-600">Moderate (45-90d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-600">High (90-200d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-slate-600">Excess (&gt;200d)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
