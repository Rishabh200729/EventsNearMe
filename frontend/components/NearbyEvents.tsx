"use client";

import { useEffect, useState } from "react";
import Event from "./Event";
import { Loader2, MapPin, AlertCircle, Map as MapIcon } from "lucide-react";
import EventMap from "./Map";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NearbyEvents({ initialEvents = [] }: { initialEvents?: any[] }) {
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

    // 1. SWR securely handles caching, loading states, and deduplication
    const { data: swrData, error: swrError, isLoading: swrLoading, mutate } = useSWR(
        userLoc ? `/api/events/nearby?lat=${userLoc[0]}&lng=${userLoc[1]}&radius=10000` : null,
        fetcher,
        { revalidateOnFocus: false }
    );
    console.log("swrData", swrData);

    const nearbyEvents = swrData?.data || [];
    const loading = !userLoc || swrLoading;
    const error = geoError || (swrError ? "Failed to load nearby events." : null);

    // 2. Derived State: Instant mathematical calculation on render. No `useState` or map merging `useEffect`!
    const mapEvents = Array.from(
        new Map([...initialEvents, ...nearbyEvents].map(evt => [evt._id, evt])).values()
    );

    // 3. Auto-sync SWR when global events (initialEvents/Server Action) change
    useEffect(() => {
        if (userLoc) {
            // Slight delay ensures the backend Redis cache was officially deleted before we re-fetch
            const timer = setTimeout(() => mutate(), 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialEvents]);

    // 4. Initial Geolocation fetch (Runs exactly once on mount)
    useEffect(() => {
        if (!navigator.geolocation) {
            setGeoError("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLoc([latitude, longitude]);
            },
            (err) => {
                console.error(err);
                if (err.code === err.PERMISSION_DENIED) {
                    setPermissionDenied(true);
                } else {
                    setGeoError("Could not determine your location.");
                }
            }
        );
    }, []);

    if (permissionDenied) {
        return (
            <div className="glass-card text-center py-12 border-yellow-500/20">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Location Access Needed</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Please enable location permissions in your browser to find amazing events happening right around you.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card text-center py-12 border-destructive/20">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2 text-destructive">Oops!</h3>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <MapPin className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Recommended for You</h2>
                    <p className="text-sm text-muted-foreground">Discover events within 10km of your current location</p>
                </div>
            </div>

            {userLoc && mapEvents.length > 0 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ml-1">
                        <MapIcon className="w-4 h-4" />
                        Interactive Discovery Zone
                    </div>
                    <EventMap events={mapEvents} center={userLoc} />
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Finding events near you...</p>
                </div>
            ) : nearbyEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearbyEvents.map((event) => (
                        <Event
                            key={event._id}
                            id={event._id}
                            title={event.title}
                            desc={event.description}
                            date={event.date}
                            category={event.category}
                            organizer={event.organizerId}
                            isJoined={false}
                            distance={event.distance}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-card text-center py-20">
                    <p className="text-muted-foreground">No events found in your immediate vicinity. Expand your horizons!</p>
                </div>
            )}
        </section>
    );
}
