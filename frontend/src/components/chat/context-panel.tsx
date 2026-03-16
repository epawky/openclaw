'use client';

import React from 'react';
import { Database, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StructuredResponse, ConfidenceLevel } from '@/lib/types';

interface ContextPanelProps {
  context: StructuredResponse['context'] | null;
}

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

export function ContextPanel({ context }: ContextPanelProps) {
  if (!context) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Query Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Ask a question to see the data context used for the answer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Query Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Confidence
          </p>
          <Badge className={cn('capitalize', confidenceColors[context.confidence])}>
            {context.confidence}
          </Badge>
        </div>

        {/* Tables Used */}
        {context.tablesUsed.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Data Sources
            </p>
            <ul className="space-y-1">
              {context.tablesUsed.map((table) => (
                <li key={table} className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  {table}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Recommendations */}
        {context.recommendationIds.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Related Recommendations
            </p>
            <ul className="space-y-1">
              {context.recommendationIds.map((id) => (
                <li key={id} className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
