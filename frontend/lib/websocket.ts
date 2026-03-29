'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Signal } from './api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useSignalWebSocket() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws/signals`);
      wsRef.current = ws;
      setConnectionStatus('connecting');

      ws.onopen = () => {
        setConnectionStatus('connected');
        retryCount.current = 0;
        // Send ping every 30s to keep alive
        const ping = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 30000);
        (ws as WebSocket & { _pingInterval?: ReturnType<typeof setInterval> })._pingInterval = ping;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type: string;
            data?: Signal[];
          };
          if (msg.type === 'initial_signals' || msg.type === 'signals_updated') {
            if (msg.data) {
              setSignals(msg.data);
              setLastUpdated(new Date());
            }
          } else if (msg.type === 'new_signal' && msg.data) {
            setSignals(prev => [msg.data as unknown as Signal, ...prev]);
            setLastUpdated(new Date());
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => setConnectionStatus('error');

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        const typedWs = ws as WebSocket & { _pingInterval?: ReturnType<typeof setInterval> };
        if (typedWs._pingInterval) clearInterval(typedWs._pingInterval);

        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
        retryCount.current++;
        retryRef.current = setTimeout(connect, delay);
      };
    } catch {
      setConnectionStatus('error');
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { signals, connectionStatus, lastUpdated };
}
