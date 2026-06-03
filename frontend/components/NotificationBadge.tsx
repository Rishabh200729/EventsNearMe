'use client';
import useSWR from "swr";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export function NotificationBadge() {
  const { data, mutate } = useSWR('/api/notifications/unread-count', fetcher, {
    refreshInterval: 30000,
  });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handler = () => {
      mutate();
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    };
    window.addEventListener('new-notification', handler);
    return () => window.removeEventListener('new-notification', handler);
  }, [mutate]);

  const count = data?.data?.count ?? 0;

  if (count === 0) return null;

  return (
    <span
      className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none px-1 transition-transform duration-300 ${
        animate ? 'scale-125' : 'scale-100'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
