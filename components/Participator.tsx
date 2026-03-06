'use client';

import { useAppContext } from "@/app/Context/store";
import Event from "./Event";

export default function Participator({ user, events }: { user: any, events: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight premium-gradient bg-clip-text text-transparent">
                        Available Events
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Discover and join the latest community gatherings
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <Event
                        key={event._id}
                        id={event._id}
                        name={event.name}
                        desc={event.description}
                        date={event.date}
                    />
                ))}
            </div>

            {events.length === 0 && (
                <div className="glass-card text-center py-20">
                    <p className="text-muted-foreground">No events found nearby. Why not create one?</p>
                </div>
            )}
        </div>
    )
}

type item = {
    name: string,
    description: string,
    date: string,
    _id: string,
    userId: string
}