"use client";

import { useEffect, useState } from "react";
import Event from "./Event";
import { Loader2, MapPin, AlertCircle, Map as MapIcon } from "lucide-react";
import EventMap from "./Map";

export default function NearbyEvents({ initialEvents = [] }: { initialEvents?: any[] }) {
    const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

    // Merge for map: combine nearby + global (removing duplicates)
    const [mapEvents, setMapEvents] = useState<any[]>([]);

    useEffect(() => {
        const unique = new Map();
        [...initialEvents, ...nearbyEvents].forEach(evt => {
            if (evt.location?.coordinates) {
                unique.set(evt._id, evt);
            }
        });
        setMapEvents(Array.from(unique.values()));
    }, [initialEvents, nearbyEvents]);

    const fetchNearby = (lat: number, lng: number) => {
        setLoading(true);
        fetch(`/api/events/nearby?lat=${lat}&lng=${lng}&radius=10000`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setNearbyEvents(data);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load nearby events.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLoc([latitude, longitude]);
                fetchNearby(latitude, longitude);
            },
            (err) => {
                console.error(err);
                if (err.code === err.PERMISSION_DENIED) {
                    setPermissionDenied(true);
                } else {
                    setError("Could not determine your location.");
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
                            name={event.name}
                            desc={event.description}
                            date={event.date}
                            category={event.category}
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
