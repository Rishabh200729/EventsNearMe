'use client';
import useSWR from "swr";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, XCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

const categoryIcons: Record<string, string> = {
  music: '🎵', tech: '💻', sports: '🏆', art: '🎨',
  community: '👥', food: '🍕', business: '💼', education: '📚',
};

export default function MyBookings() {
  const { data, error, isLoading } = useSWR('/api/bookings', fetcher);

  return (
    <div className="min-h-screen p-6 pt-24 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-8">
        My Bookings
      </h1>

      {isLoading && <p className="text-muted-foreground">Loading your bookings...</p>}
      {error && <p className="text-red-500">Failed to load bookings</p>}

      {data && data.data.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">You haven&apos;t booked any events yet.</p>
          <Link href="/explore" className="premium-button inline-block py-3 px-6">
            Browse Events
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="space-y-4">
          {data.data.map((booking: any) => {
            const event = booking.event;
            if (!event) return null;

            return (
              <div key={booking._id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryIcons[event.category?.toLowerCase()] || '📅'}</span>
                    <Link href={`/events/${event._id}`} className="text-lg font-semibold hover:text-primary transition-colors">
                      {event.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    {event.location?.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location.address}
                      </div>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Qty: {booking.quantity} | Total: ${booking.totalAmount}
                  </div>
                </div>
                <Link
                  href={`/events/${event._id}`}
                  className="premium-button text-sm flex items-center gap-2 py-2.5 px-5 shrink-0"
                >
                  View Event
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
