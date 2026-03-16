'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';
import { Header } from '@/components/layout';
import { ChatMessage, ChatInput, SuggestedPrompts, ContextPanel } from '@/components/chat';
import { api } from '@/lib/api';
import type { ChatMessage as ChatMessageType, StructuredResponse } from '@/lib/types';

export default function AskPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<StructuredResponse['context'] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await api.ask({ question });

      // Add assistant message
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
      // Add error message
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

  const handleSuggestedPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Ask the COO"
        subtitle="Natural-language Q&A grounded in your store data"
        lastAgentRun="2 hours ago"
        dataFreshness="fresh"
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 mb-6">
                  <Bot className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Ask the AI COO
                </h2>
                <p className="text-sm text-slate-500 text-center mb-8">
                  Get insights about your store performance, inventory, customers, and more.
                  Ask anything in natural language.
                </p>
                <SuggestedPrompts onSelect={handleSuggestedPrompt} />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
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
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <Bot className="h-4 w-4 text-slate-700" />
                      </div>
                      <div className="rounded-lg border border-surface-border bg-white p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                          <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse delay-150" />
                          <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse delay-300" />
                          <span className="text-sm text-slate-500 ml-2">
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
          <div className="border-t border-surface-border bg-surface-secondary p-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSend={handleSend} loading={loading} />
            </div>
          </div>
        </div>

        {/* Context Panel */}
        <div className="hidden lg:block w-80 border-l border-surface-border bg-white p-4">
          <ContextPanel context={currentContext} />
        </div>
      </div>
    </div>
  );
}
