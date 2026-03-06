"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { Music, Code, Trophy, Palette, Users, Info, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface EventMarker {
    _id: string;
    name: string;
    category?: string;
    location: {
        coordinates: [number, number];
    };
}

const createCustomIcon = (category?: string) => {
    let color = "#A855F7"; // primary
    switch (category) {
        case 'Music': color = "#EC4899"; break;
        case 'Tech': color = "#3B82F6"; break;
        case 'Sports': color = "#22C55E"; break;
        case 'Arts': color = "#F97316"; break;
        case 'Community': color = "#8B5CF6"; break;
    }

    return L.divIcon({
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px ${color}"></div>`,
        className: 'custom-map-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

function ChangeView({ center, events, autoFit }: { center: [number, number], events: EventMarker[], autoFit?: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (autoFit && events.length > 0) {
            const bounds = L.latLngBounds(events.map(e => [e.location.coordinates[1], e.location.coordinates[0]]));
            // Add user location to bounds as well
            bounds.extend(center);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else {
            map.setView(center, map.getZoom() || 13);
        }
    }, [center, events, autoFit, map]);

    return null;
}

export default function MapComponent({ events, center, autoFit = true }: { events: EventMarker[], center: [number, number], autoFit?: boolean }) {
    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full bg-[#0b0a0f]"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ChangeView center={center} events={events} autoFit={autoFit} />

                {events.map((event) => {
                    if (!event.location?.coordinates) return null;
                    const [lng, lat] = event.location.coordinates;
                    return (
                        <Marker
                            key={event._id}
                            position={[lat, lng]}
                            icon={createCustomIcon(event.category)}
                        >
                            <Popup className="premium-popup">
                                <div className="p-2 min-w-[200px] bg-[#0b0a0f] text-foreground">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                                        {event.category || 'Event'}
                                    </span>
                                    <h3 className="text-sm font-bold text-white mb-2 leading-tight">
                                        {event.name}
                                    </h3>
                                    <Link
                                        href={`#${event._id}`}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                                    >
                                        View Details <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <style jsx global>{`
                .leaflet-container {
                    cursor: default !important;
                }
                .leaflet-popup-content-wrapper {
                    background: #0b0a0f !important;
                    color: white !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .leaflet-popup-tip {
                    background: #0b0a0f !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                }
                .leaflet-bar {
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 8px !important;
                    overflow: hidden;
                }
                .leaflet-bar a {
                    background: #1a1625 !important;
                    color: #fff !important;
                    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                }
                .leaflet-bar a:hover {
                    background: #2D243F !important;
                }
            `}</style>
        </div>
    );
}
