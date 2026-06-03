'use client';
import { useEffect, useRef } from 'react';

// Dispatches a 'new-notification' custom event when SSE delivers a notification
export function NotificationSSE() {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count', { credentials: 'include' });
        if (!res.ok) return;
      } catch {
        return;
      }

      const es = new EventSource('/api/notifications/stream');
      esRef.current = es;

      es.onmessage = (event) => {
        if (event.data && event.data !== '{"type":"connected"}') {
          window.dispatchEvent(new CustomEvent('new-notification', { detail: event.data }));
        }
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
    };
  }, []);

  return null;
}
