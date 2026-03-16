'use client';

import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { SlowMover } from '@/lib/types';

interface SlowMoversTableProps {
  data: SlowMover[];
  onRowClick?: (item: SlowMover) => void;
}

export function SlowMoversTable({ data, onRowClick }: SlowMoversTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600">
          Slow Movers
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
                <th className="table-header px-4 py-3 text-right">30d Units</th>
                <th className="table-header px-4 py-3 text-right">Inv Days</th>
                <th className="table-header px-4 py-3 text-right">30d Revenue</th>
                <th className="table-header px-4 py-3 text-left">Recommendation</th>
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
                    <span className={cn(
                      'text-sm',
                      item.unitsSold30Day === 0 ? 'text-red-600 font-medium' : 'text-slate-600'
                    )}>
                      {formatNumber(item.unitsSold30Day)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.inventoryDays > 200 && 'text-red-600',
                        item.inventoryDays > 90 && item.inventoryDays <= 200 && 'text-orange-600',
                        item.inventoryDays <= 90 && 'text-slate-600'
                      )}
                    >
                      {item.inventoryDays > 365 ? '365+' : formatNumber(item.inventoryDays)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-600">
                      {formatCurrency(item.revenue30Day)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 max-w-xs">
                      <Info className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 truncate">
                        {item.recommendation}
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
