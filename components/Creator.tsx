"use client";
import { addEventAction } from "@/actions/add-event-action";
import { useRef, useState, useCallback } from "react";
import { Plus, MapPin, Check, Loader2 } from "lucide-react";

type user = {
    email: string;
    id: string;
    role: string;
}

import InteractiveLocationPicker from "./InteractiveLocationPicker";

export default function Creator({ user }: { user: user }) {
    const ref = useRef<HTMLFormElement>(null);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setLocation({ lat, lng });
    }, []);

    return (
        <div className="glass-card max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Plus className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Create New Event</h2>
            </div>

            <form className="space-y-6" ref={ref} action={async (formData) => {
                await addEventAction(formData);
                ref.current?.reset();
            }}>
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Event Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                        placeholder="E.g. Tech Meetup 2026"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="desc" className="text-sm font-medium text-muted-foreground">Description</label>
                    <textarea
                        name="desc"
                        id="desc"
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-foreground"
                        placeholder="Tell us more about the event..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-muted-foreground">Date</label>
                    <input
                        type="date"
                        name="date"
                        id="date"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                        required
                    />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Pin Event on Map
                    </label>
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-inner">
                        <InteractiveLocationPicker
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                    {location && (
                        <div className="flex gap-4 px-1">
                            <input type="hidden" name="lat" value={location.lat} />
                            <input type="hidden" name="lng" value={location.lng} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium text-muted-foreground">Event Category</label>
                        <select
                            name="category"
                            id="category"
                            className="w-full bg-[#1a1625] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground appearance-none"
                            required
                        >
                            <option value="Community">Community</option>
                            <option value="Tech">Tech</option>
                            <option value="Music">Music</option>
                            <option value="Sports">Sports</option>
                            <option value="Arts">Arts</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="premium-button w-full py-4 text-lg">
                    Launch Event
                </button>
            </form>
        </div>
    )
}