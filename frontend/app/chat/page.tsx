'use client';
import { useState, useRef, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { LeftToolbar } from '@/components/layout/LeftToolbar';
import { RightPanel } from '@/components/layout/RightPanel';
import { Send, BrainCircuit, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'Explain the IREDA bulk deal signal — should I buy?',
  'What is a golden cross and why does it matter?',
  'How do I read the confidence score?',
  'Which signals have the highest historical success rate?',
  'What sectors have the most signals today?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your NiveshAI assistant, powered by Gemini. I can explain signals, analyze stocks, and help you understand what\'s happening in Indian markets today. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const resp = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      });

      let replyText = 'I apologize, I couldn\'t process your request right now. Please try again.';

      if (resp.ok) {
        const data = await resp.json() as { reply: string };
        replyText = data.reply;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please ensure the backend is running on port 8000.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ background: '#131722', minHeight: '100vh' }}>
      <TopBar />
      <LeftToolbar />
      <RightPanel />

      {/* Chat area layout */}
      <div style={{
        marginLeft: 56, marginRight: 320, marginTop: 48,
        height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          height: 48, borderBottom: '1px solid #363a45',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8,
        }}>
          <BrainCircuit size={18} style={{ color: '#2962ff' }} />
          <span style={{ fontSize: 14, color: '#d1d4dc', fontWeight: 500 }}>NiveshAI Assistant</span>
          <span style={{ fontSize: 12, color: '#787b86', marginLeft: 8 }}>Powered by Gemini</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#26a69a', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#26a69a' }}>Operational</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex', gap: 12, marginBottom: 20,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'assistant' ? '#2962ff' : '#363a45',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'assistant'
                  ? <BrainCircuit size={16} style={{ color: '#fff' }} />
                  : <User size={16} style={{ color: '#d1d4dc' }} />
                }
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: '70%' }}>
                <div style={{
                  background: msg.role === 'assistant' ? '#1e222d' : '#2962ff',
                  border: msg.role === 'assistant' ? '1px solid #363a45' : 'none',
                  borderRadius: msg.role === 'assistant' ? '0 8px 8px 8px' : '8px 0 8px 8px',
                  padding: '12px 16px',
                  fontSize: 14, color: '#d1d4dc', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 11, color: '#4c525e', marginTop: 4,
                  textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#2962ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <BrainCircuit size={16} style={{ color: '#fff' }} />
              </div>
              <div style={{
                background: '#1e222d', border: '1px solid #363a45',
                borderRadius: '0 8px 8px 8px', padding: '16px 20px',
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#787b86',
                    animation: `bounce ${0.6 + i * 0.1}s infinite alternate`,
                    animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => send(q)} style={{
                background: '#1e222d', border: '1px solid #363a45',
                color: '#787b86', fontSize: 12, padding: '6px 12px', borderRadius: 4,
                cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'Inter',
                transition: 'all 150ms', maxWidth: 280,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2962ff'; (e.currentTarget as HTMLElement).style.color = '#d1d4dc'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#363a45'; (e.currentTarget as HTMLElement).style.color = '#787b86'; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          borderTop: '1px solid #363a45', padding: '12px 24px',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any signal, stock, or market trend... (Enter to send)"
            rows={1}
            style={{
              flex: 1, background: '#2a2e39', border: '1px solid #363a45',
              borderRadius: 8, color: '#d1d4dc', fontSize: 14,
              padding: '12px 16px', fontFamily: 'Inter', resize: 'none',
              outline: 'none', minHeight: 44, maxHeight: 120, lineHeight: 1.5,
            }}
            onFocus={e => (e.target.style.borderColor = '#2962ff')}
            onBlur={e => (e.target.style.borderColor = '#363a45')}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, background: input.trim() ? '#2962ff' : '#2a2e39',
              border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 150ms',
            }}
          >
            <Send size={16} style={{ color: input.trim() ? '#fff' : '#787b86' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
