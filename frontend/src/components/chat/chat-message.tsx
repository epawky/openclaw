'use client';

import React from 'react';
import { User, Bot, ArrowRight, FileText, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, ConfidenceLevel } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUp?: (question: string) => void;
  onRecommendationClick?: (id: string) => void;
}

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-red-600 bg-red-50',
};

export function ChatMessage({
  message,
  onFollowUp,
  onRecommendationClick,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const structured = message.structuredResponse;

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="rounded-lg bg-brand-600 px-4 py-3 text-white">
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
            <User className="h-4 w-4 text-brand-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start gap-3 max-w-3xl">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Bot className="h-4 w-4 text-slate-700" />
        </div>
        <div className="space-y-4">
          {/* Main Answer */}
          <div className="rounded-lg border border-surface-border bg-white p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{message.content}</p>
          </div>

          {/* Structured Response */}
          {structured && (
            <>
              {/* Direct Answer */}
              <Card className="border-brand-200 bg-brand-50/50">
                <CardHeader className="pb-2 pt-3 px-4">
                  <h4 className="text-xs font-semibold text-brand-800 uppercase tracking-wider">
                    Key Takeaway
                  </h4>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm font-medium text-brand-900">
                    {structured.directAnswer}
                  </p>
                </CardContent>
              </Card>

              {/* Supporting Evidence */}
              {structured.supportingEvidence.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supporting Evidence
                    </h4>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="space-y-2">
                      {structured.supportingEvidence.map((evidence, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          {evidence.description}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Related Recommendations */}
              {structured.relatedRecommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Related Recommendations
                    </h4>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="space-y-2">
                      {structured.relatedRecommendations.map((rec) => (
                        <li
                          key={rec.id}
                          onClick={() => onRecommendationClick?.(rec.id)}
                          className={cn(
                            'flex items-center justify-between rounded-lg bg-slate-50 p-2',
                            onRecommendationClick && 'cursor-pointer hover:bg-slate-100'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-brand-500" />
                            <span className="text-sm text-slate-700">{rec.title}</span>
                          </div>
                          {onRecommendationClick && (
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up Suggestions */}
              {structured.suggestedFollowUps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Follow-up Questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {structured.suggestedFollowUps.map((followUp, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => onFollowUp?.(followUp)}
                        className="text-xs"
                      >
                        {followUp}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Footer */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize',
                    confidenceColors[structured.context.confidence]
                  )}
                >
                  {structured.context.confidence} confidence
                </Badge>
                <span>
                  Data sources: {structured.context.tablesUsed.join(', ')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
