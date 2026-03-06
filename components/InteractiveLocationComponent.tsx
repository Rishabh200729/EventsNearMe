"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import { Loader2, MapPin, Crosshair } from "lucide-react";

const customIcon = L.divIcon({
    html: `<div style="background-color: #A855F7; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px #A855F7"></div>`,
    className: 'custom-picker-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return (
        <Marker position={position} icon={customIcon} />
    );
}

function CenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

export default function InteractiveLocationComponent({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<[number, number]>([30.7333, 76.7794]); // Default: Chandigarh
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        onLocationSelect(position[0], position[1]);
    }, [position, onLocationSelect]);

    const handleUseMyLocation = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setPosition(newPos);
                setLoading(false);
            },
            () => setLoading(false)
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground italic">Click on the map to set location or use button</span>
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-white transition-colors bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/20"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
                    Use Current Location
                </button>
            </div>

            <div className="h-[250px] w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
                <MapContainer
                    center={position}
                    zoom={13}
                    className="h-full w-full bg-[#0b0a0f]"
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                    <CenterMap position={position} />
                </MapContainer>
            </div>

            <div className="flex gap-4 text-[10px] text-muted-foreground font-mono">
                <span>LAT: {position[0].toFixed(5)}</span>
                <span>LNG: {position[1].toFixed(5)}</span>
            </div>
        </div>
    );
}
