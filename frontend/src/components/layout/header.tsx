'use client';

import React from 'react';
import { Calendar, RefreshCw, Store, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  lastAgentRun?: string;
  dataFreshness?: 'fresh' | 'stale' | 'updating';
}

export function Header({ title, subtitle, lastAgentRun, dataFreshness = 'fresh' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-border bg-surface-primary px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Data Freshness Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={
              dataFreshness === 'fresh'
                ? 'success'
                : dataFreshness === 'stale'
                ? 'warning'
                : 'secondary'
            }
            className="flex items-center gap-1"
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                dataFreshness === 'fresh' && 'bg-green-500',
                dataFreshness === 'stale' && 'bg-yellow-500',
                dataFreshness === 'updating' && 'bg-blue-500 animate-pulse'
              )}
            />
            {dataFreshness === 'fresh' && 'Data Fresh'}
            {dataFreshness === 'stale' && 'Data Stale'}
            {dataFreshness === 'updating' && 'Updating...'}
          </Badge>
        </div>

        {/* Last Agent Run */}
        {lastAgentRun && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Agent ran {lastAgentRun}</span>
          </div>
        )}

        {/* Date Range Selector */}
        <Select defaultValue="7d">
          <SelectTrigger className="w-[140px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {/* Store Selector (placeholder for multi-store) */}
        <Select defaultValue="main">
          <SelectTrigger className="w-[180px]">
            <Store className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Main Store</SelectItem>
            <SelectItem value="eu" disabled>
              EU Store (Coming soon)
            </SelectItem>
            <SelectItem value="asia" disabled>
              APAC Store (Coming soon)
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
