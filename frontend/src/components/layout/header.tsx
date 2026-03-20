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
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { DemoIndicator } from '@/components/demo';

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'custom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  lastAgentRun?: string;
  dataFreshness?: 'fresh' | 'stale' | 'updating';
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

export function Header({
  title,
  subtitle,
  lastAgentRun,
  dataFreshness = 'fresh',
  dateRange = '7d',
  onDateRangeChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-cartex bg-cartex-surface px-4 py-3 lg:px-6 lg:py-0 lg:h-16 lg:flex lg:items-center lg:justify-between">
      {/* Title row - always visible */}
      <div className="flex items-center justify-between lg:block">
        <div>
          <h1 className="text-lg lg:text-xl font-semibold text-cartex">{title}</h1>
          {subtitle && <p className="text-xs lg:text-sm text-cartex-muted">{subtitle}</p>}
        </div>
        {/* Mobile-only quick actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button variant="outline" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls row - scrollable on mobile */}
      <div className="flex items-center gap-2 lg:gap-4 mt-3 lg:mt-0 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
        {/* Demo Mode Indicator */}
        <DemoIndicator />

        {/* Data Freshness Badge */}
        <Badge
          variant={
            dataFreshness === 'fresh'
              ? 'success'
              : dataFreshness === 'stale'
              ? 'warning'
              : 'secondary'
          }
          className="flex items-center gap-1 flex-shrink-0"
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              dataFreshness === 'fresh' && 'bg-green-500',
              dataFreshness === 'stale' && 'bg-yellow-500',
              dataFreshness === 'updating' && 'bg-blue-500 animate-pulse'
            )}
          />
          <span className="hidden sm:inline">
            {dataFreshness === 'fresh' && 'Data Fresh'}
            {dataFreshness === 'stale' && 'Data Stale'}
            {dataFreshness === 'updating' && 'Updating...'}
          </span>
        </Badge>

        {/* Last Agent Run - hidden on small mobile */}
        {lastAgentRun && (
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-cartex-muted flex-shrink-0">
            <Clock className="h-4 w-4" />
            <span>Agent ran {lastAgentRun}</span>
          </div>
        )}

        {/* Date Range Selector */}
        <Select value={dateRange} onValueChange={(value) => onDateRangeChange?.(value as DateRange)}>
          <SelectTrigger className="w-[120px] lg:w-[140px] flex-shrink-0">
            <Calendar className="mr-1 lg:mr-2 h-4 w-4" />
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {/* Store Selector - hidden on mobile */}
        <Select defaultValue="main">
          <SelectTrigger className="hidden md:flex w-[140px] lg:w-[180px] flex-shrink-0">
            <Store className="mr-1 lg:mr-2 h-4 w-4" />
            <SelectValue placeholder="Store" />
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

        {/* Theme Toggle - desktop only (mobile has it in title row) */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Refresh Button - desktop only (mobile has it in title row) */}
        <Button variant="outline" size="icon" className="hidden lg:flex">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
