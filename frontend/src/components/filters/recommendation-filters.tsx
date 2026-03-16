'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PriorityLevel, RecommendationStatus, RecommendationType } from '@/lib/types';

interface FilterState {
  status: RecommendationStatus[];
  type: RecommendationType[];
  priority: PriorityLevel[];
}

interface RecommendationFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const statusOptions: { value: RecommendationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'in_progress', label: 'In Progress' },
];

const typeOptions: { value: RecommendationType; label: string }[] = [
  { value: 'stockout_risk', label: 'Stockout Risk' },
  { value: 'slow_mover', label: 'Slow Mover' },
  { value: 'promotion_opportunity', label: 'Promotion' },
  { value: 'pricing_adjustment', label: 'Pricing' },
  { value: 'customer_retention', label: 'Retention' },
  { value: 'bundle_opportunity', label: 'Bundle' },
  { value: 'reorder_suggestion', label: 'Reorder' },
];

const priorityOptions: { value: PriorityLevel; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function RecommendationFilters({ filters, onChange }: RecommendationFiltersProps) {
  const hasActiveFilters =
    filters.status.length > 0 || filters.type.length > 0 || filters.priority.length > 0;

  const clearFilters = () => {
    onChange({ status: [], type: [], priority: [] });
  };

  const toggleStatus = (value: RecommendationStatus) => {
    const current = filters.status;
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, status: newValue });
  };

  const toggleType = (value: RecommendationType) => {
    const current = filters.type;
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, type: newValue });
  };

  const togglePriority = (value: PriorityLevel) => {
    const current = filters.priority;
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, priority: newValue });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status[0] || ''}
          onValueChange={(value) => {
            if (value) {
              toggleStatus(value as RecommendationStatus);
            }
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={filters.type[0] || ''}
          onValueChange={(value) => {
            if (value) {
              toggleType(value as RecommendationType);
            }
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority[0] || ''}
          onValueChange={(value) => {
            if (value) {
              togglePriority(value as PriorityLevel);
            }
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleStatus(status)}
            >
              {statusOptions.find((o) => o.value === status)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.type.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleType(type)}
            >
              {typeOptions.find((o) => o.value === type)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.priority.map((priority) => (
            <Badge
              key={priority}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => togglePriority(priority)}
            >
              {priorityOptions.find((o) => o.value === priority)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
