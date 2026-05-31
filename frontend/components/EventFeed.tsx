"use client";
import Event from "./Event";

interface EventFeedProps {
    initialEvents: any[];
    rsvps: any[];
    user: any;
}

export default function EventFeed({ initialEvents, rsvps, user }: EventFeedProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialEvents.map((event: any, index: number) => (
                <div key={event._id || `fallback-${index}`}>
                    <Event
                        id={event._id}
                        title={event.title}
                        desc={event.description}
                        date={event.date}
                        category={event.category}
                        userRole={user?.role}
                        organizer={event.organizerId}
                        isJoined={rsvps.some((r: any) => r.eventId === event._id && r.userId === user?.id)}
                        isOrganizer={user?.id === event.organizerId?._id || user?.id === event.organizerId}
                    />
                </div>
            ))}
        </section>
    );
}
