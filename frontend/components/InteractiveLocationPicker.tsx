"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const InteractiveLocationComponent = dynamic(() => import("./InteractiveLocationComponent"), {
    ssr: false,
    loading: () => (
        <div className="h-[250px] w-full rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading Map Picker...</p>
        </div>
    )
});

export default function InteractiveLocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    return <InteractiveLocationComponent onLocationSelect={onLocationSelect} />;
}
