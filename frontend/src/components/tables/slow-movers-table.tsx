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
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--cartex-muted)' }}>
          Slow Movers
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
                    <span
                      className="text-sm"
                      style={{
                        color: item.unitsSold30Day === 0 ? 'var(--cartex-danger)' : 'var(--cartex-muted)',
                        fontWeight: item.unitsSold30Day === 0 ? 500 : 400
                      }}
                    >
                      {formatNumber(item.unitsSold30Day)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: item.inventoryDays > 200
                          ? 'var(--cartex-danger)'
                          : item.inventoryDays > 90
                          ? 'var(--cartex-ember)'
                          : 'var(--cartex-muted)'
                      }}
                    >
                      {item.inventoryDays > 365 ? '365+' : formatNumber(item.inventoryDays)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: 'var(--cartex-muted)' }}>
                      {formatCurrency(item.revenue30Day)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 max-w-xs">
                      <Info className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--cartex-teal)' }} />
                      <span className="text-xs truncate" style={{ color: 'var(--cartex-muted)' }}>
                        {item.recommendation}
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
