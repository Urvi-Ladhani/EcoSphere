import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const SESSION_STORAGE_KEY = 'ecosphere-esg-assistant-history';
const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hi — I can help interpret EcoSphere data, explain ESG concepts, or suggest practical next steps. What would you like to know?'
};

export interface ESGAssistantContext {
  employeeCount: number;
  departmentScores: Array<{ name: string; total: number; environmental: number; social: number; governance: number }>;
  activeGoals: Array<{ title: string; progress: number; target: number; unit: string }>;
  openComplianceIssues: number;
  activeChallenges: number;
}

export default function ESGAssistant({ context }: { context: ESGAssistantContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [WELCOME_MESSAGE];
    } catch {
      return [WELCOME_MESSAGE];
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const askAssistant = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    const history = messages.slice(1).filter((message) => message.content.trim());
    setMessages((current) => [
      ...current,
      { role: 'user', content: trimmedQuestion },
      { role: 'assistant', content: '' }
    ]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/esg-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion, context, history })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to get an answer.');
      }
      if (!response.body) throw new Error('Unable to receive the assistant response.');

      // Support a running pre-stream server during hot reloads. Once the server
      // is restarted it returns text chunks, but older instances return JSON.
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (!data.answer) throw new Error('The assistant returned an empty response.');
        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = { role: 'assistant', content: data.answer };
          return updated;
        });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = { role: 'assistant', content: answer };
          return updated;
        });
      }
      answer += decoder.decode();
      if (!answer.trim()) throw new Error('The assistant returned an empty response.');
    } catch (error: any) {
      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: error.message || 'The assistant is temporarily unavailable. Please try again.'
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50" id="esg_assistant">
      {isOpen && (
        <section className="mb-3 flex h-[min(34rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" aria-label="EcoSphere ESG assistant">
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20"><Sparkles className="h-4 w-4 text-emerald-300" /></div>
              <div><h2 className="text-sm font-bold">ESG Assistant</h2><p className="text-[10px] text-slate-300">Powered by Gemini</p></div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close ESG assistant"><X className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100"><Bot className="h-3.5 w-3.5 text-emerald-700" /></div>}
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${message.role === 'user' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                  {message.content || (isLoading && index === messages.length - 1 ? (
                    <span className="flex items-center gap-1.5 py-0.5" aria-label="Assistant is typing">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                    </span>
                  ) : message.content)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={askAssistant} className="flex gap-2 border-t border-slate-100 bg-white p-3">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={isLoading} maxLength={2000} placeholder="Ask about ESG performance…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 disabled:cursor-not-allowed" />
            <button type="submit" disabled={!question.trim() || isLoading} className="rounded-xl bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200" aria-label="Send message"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700" aria-expanded={isOpen} aria-controls="esg_assistant">
        <MessageCircle className="h-4 w-4" /> {isOpen ? 'Close assistant' : 'Ask ESG Assistant'}
      </button>
    </div>
  );
}
