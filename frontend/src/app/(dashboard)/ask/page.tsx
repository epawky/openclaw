'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  AlertCircle,
  TrendingDown,
  AlertTriangle,
  Users,
  Heart,
  Send,
  Loader2,
  Clock,
  Calendar,
  Bot
} from 'lucide-react';
import { ChatMessage, ContextPanel } from '@/components/chat';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { ChatMessage as ChatMessageType, StructuredResponse } from '@/lib/types';

interface SuggestedQuestion {
  icon: React.ReactNode;
  text: string;
  variant: 'info' | 'warning' | 'danger' | 'success' | 'neutral';
}

const suggestedQuestions: SuggestedQuestion[] = [
  {
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    text: "What's broken right now?",
    variant: 'info',
  },
  {
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    text: "Why did revenue tank last week?",
    variant: 'warning',
  },
  {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    text: "Which SKUs are about to run out?",
    variant: 'danger',
  },
  {
    icon: <Users className="h-3.5 w-3.5" />,
    text: "What's driving repeat buyers?",
    variant: 'success',
  },
  {
    icon: <Heart className="h-3.5 w-3.5" />,
    text: "What should we push this week?",
    variant: 'neutral',
  },
];

const variantStyles: Record<string, string> = {
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
  danger: 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  neutral: 'border-gray-500/30 bg-gray-500/10 text-gray-400 hover:bg-gray-500/20',
};

export default function AskPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<StructuredResponse['context'] | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.ask({ question });

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.data.answer,
        timestamp: new Date().toISOString(),
        structuredResponse: response.data.structuredResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentContext(response.data.structuredResponse.context);
    } catch (err) {
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = (question: string) => {
    handleSend(question);
  };

  const handleRecommendationClick = (id: string) => {
    router.push(`/action-queue?id=${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cartex-bg)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 lg:px-5 lg:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ background: '#111827', borderBottom: '0.5px solid var(--cartex-border)' }}
      >
        <div>
          <div className="text-white font-medium text-[15px] tracking-tight">Whiskr</div>
          <div className="text-gray-500 text-[11px] mt-0.5">Real-time store intelligence. No dashboards required.</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant="success" className="flex items-center gap-1.5 text-[11px] px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Data Fresh
          </Badge>
          <span className="text-gray-500 text-[11px] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Agent ran 2 hours ago
          </span>
          <span
            className="border rounded-md px-2.5 py-1 text-gray-300 text-[11px] flex items-center gap-1.5"
            style={{ borderColor: '#374151' }}
          >
            <Calendar className="h-3 w-3" />
            Last 7 days
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Messages or Empty State */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full px-6 py-8">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <Lock className="h-6 w-6 text-blue-400" />
                </div>

                {/* Title */}
                <h2
                  className="text-[22px] font-medium mb-2 tracking-tight"
                  style={{ color: 'var(--cartex-text)' }}
                >
                  Ask Whiskr
                </h2>

                {/* Description */}
                <p
                  className="text-sm text-center max-w-[440px] mb-8 leading-relaxed"
                  style={{ color: 'var(--cartex-muted)' }}
                >
                  Your store has the answers. Whiskr finds them.
                  <br />
                  Ask anything about revenue, inventory, customers, or performance.
                </p>

                {/* Suggested Questions */}
                <div className="w-full max-w-[620px]">
                  <div
                    className="text-[11px] font-medium mb-2.5 tracking-wider uppercase"
                    style={{ color: 'var(--cartex-muted)' }}
                  >
                    Suggested questions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question.text}
                        onClick={() => handleSend(question.text)}
                        className={`
                          border rounded-lg px-3 py-1.5 text-[13px]
                          flex items-center gap-1.5 cursor-pointer
                          transition-colors duration-150
                          ${variantStyles[question.variant]}
                        `}
                      >
                        {question.icon}
                        {question.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="max-w-3xl mx-auto p-4 lg:p-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onFollowUp={handleFollowUp}
                    onRecommendationClick={handleRecommendationClick}
                  />
                ))}

                {loading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'var(--cartex-surface)' }}
                      >
                        <Bot className="h-4 w-4" style={{ color: 'var(--cartex-text)' }} />
                      </div>
                      <div
                        className="rounded-lg p-4"
                        style={{ background: 'var(--cartex-surface)', border: '0.5px solid var(--cartex-border)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                          <span className="text-sm ml-2" style={{ color: 'var(--cartex-muted)' }}>
                            Analyzing your data...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            className="px-4 py-3 lg:px-5"
            style={{
              borderTop: '0.5px solid var(--cartex-border)',
              background: 'var(--cartex-surface)'
            }}
          >
            <div className="max-w-[620px] mx-auto relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Whiskr anything about your store..."
                disabled={loading}
                className="w-full px-4 py-2.5 pr-12 text-[13px] rounded-lg border outline-none transition-colors"
                style={{
                  background: 'var(--cartex-bg)',
                  borderColor: 'var(--cartex-border)',
                  color: 'var(--cartex-text)',
                }}
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || loading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-opacity disabled:opacity-50"
                style={{ background: 'rgba(16, 185, 129, 0.2)' }}
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>
            </div>
            <div
              className="text-center text-[11px] mt-2"
              style={{ color: 'var(--cartex-muted)' }}
            >
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Context Panel - Desktop only */}
        <div
          className="hidden lg:block w-80 p-4"
          style={{
            borderLeft: '0.5px solid var(--cartex-border)',
            background: 'var(--cartex-surface)'
          }}
        >
          <ContextPanel context={currentContext} />
        </div>
      </div>
    </div>
  );
}
