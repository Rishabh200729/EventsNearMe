"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Initializing Map Engine...</p>
        </div>
    )
});

interface EventMarker {
    _id: string;
    name: string;
    category?: string;
    location: {
        coordinates: [number, number];
    };
}

export default function Map({ events, center }: { events: EventMarker[], center: [number, number] }) {
    return <MapComponent events={events} center={center} />;
}
