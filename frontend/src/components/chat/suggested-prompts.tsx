'use client';

import React from 'react';
import { MessageSquare, TrendingDown, AlertTriangle, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  {
    icon: MessageSquare,
    text: 'What needs attention today?',
    color: 'text-brand-600',
    bg: 'bg-brand-50 hover:bg-brand-100',
  },
  {
    icon: TrendingDown,
    text: 'Why did revenue drop last week?',
    color: 'text-orange-600',
    bg: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    icon: AlertTriangle,
    text: 'Which SKUs are at risk?',
    color: 'text-red-600',
    bg: 'bg-red-50 hover:bg-red-100',
  },
  {
    icon: Users,
    text: 'What changed in repeat purchases?',
    color: 'text-green-600',
    bg: 'bg-green-50 hover:bg-green-100',
  },
  {
    icon: Tag,
    text: 'What should we promote?',
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100',
  },
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-600">Suggested Questions</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={suggestion.text}
              variant="ghost"
              onClick={() => onSelect(suggestion.text)}
              className={`${suggestion.bg} ${suggestion.color} border-0 justify-start`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {suggestion.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
