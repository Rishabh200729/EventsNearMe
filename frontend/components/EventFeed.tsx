"use client";
import { useOptimistic } from "react";
import Event from "./Event";
import Creator from "./Creator";

interface EventFeedProps {
    initialEvents: any[];
    rsvps: any[];
    user: any;
}

export default function EventFeed({ initialEvents, rsvps, user }: EventFeedProps) {
    const [optimisticEvents, addOptimisticEvent] = useOptimistic(
        initialEvents,
        (state, newEvent: any) => {
            return [newEvent, ...state];
        }
    );

    return (
        <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {optimisticEvents.map((event: any) => (
                    <div key={event._id || Math.random().toString()} className={event.pending ? "opacity-60 pointer-events-none transition-all" : ""}>
                        <Event
                            id={event._id}
                            title={event.title}
                            desc={event.description}
                            date={event.date}
                            category={event.category}
                            userRole={user?.role}
                            organizer={event.organizerId}
                            isJoined={rsvps.some((r: any) => r.eventId === event._id && r.userId === user?.id)}
                        />
                    </div>
                ))}
            </section>

            <section className="mt-12 border-t border-white/5 pt-12">
                {user?.role === "organizer" && (
                    <Creator user={user} addOptimisticEvent={addOptimisticEvent} />
                )}
            </section>
        </>
    );
}
