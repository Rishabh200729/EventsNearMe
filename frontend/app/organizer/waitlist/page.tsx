'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export default function WaitlistPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
    const params = use(searchParams);
    const eventId = params.eventId;
    const router = useRouter();

    const { data: eventData, error: eventError } = useSWR(eventId ? `/api/events/${eventId}` : null, fetcher);
    const { data: waitlistData, error: waitlistError } = useSWR(eventId ? `/api/bookings/events/${eventId}/waitlist/all` : null, fetcher, { refreshInterval: 5000 });

    if (!eventId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="w-12 h-12 text-yellow-500 mb-4 opacity-50" />
                <h2 className="text-2xl font-bold tracking-tight text-white">No Event Selected</h2>
                <p className="text-muted-foreground">Please select an event from your dashboard to view its waitlist.</p>
                <Link href="/dashboard" className="premium-button px-6 py-3 font-medium">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const isLoading = !eventData || (!waitlistData && !waitlistError);
    const error = eventError || waitlistError || (waitlistData && !waitlistData.success ? waitlistData.error : null);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading waitlist queue...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive mb-4 opacity-50" />
                <h2 className="text-2xl font-bold tracking-tight text-white">Error</h2>
                <p className="text-muted-foreground">{error.message || 'Failed to load waitlist data. Are you the organizer?'}</p>
                <Link href="/dashboard" className="premium-button px-6 py-3 font-medium">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const event = eventData?.data;
    const waitlist = waitlistData?.data || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{event?.title} - Waitlist</h1>
                    <p className="text-muted-foreground mt-1">Manage the standby queue for your event</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary/20 text-primary rounded-xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">People Waiting</p>
                        <p className="text-2xl font-bold">{waitlist.length}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-semibold">Waitlist Queue (FIFO)</h2>
                </div>
                
                {waitlist.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">The waitlist is empty</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">When the event sells out, new users will queue here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {waitlist.map((entry: any) => (
                            <div key={entry._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                        #{entry.position}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {entry.user?.firstName} {entry.user?.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Requested {entry.quantity} {entry.quantity === 1 ? 'seat' : 'seats'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        Joined on {new Date(entry.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        {new Date(entry.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
