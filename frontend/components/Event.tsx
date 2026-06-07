"use client";
import { Calendar, CheckCircle, Loader2, Music, Code, Users, Trophy, Palette, Info, MapPin, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { joinEventAction } from "@/actions/rsvp-actions";
import SubmitButton from "./SubmitButton";

interface propTypes {
    id: string;
    title: string;
    desc: string;
    date: string;
    category?: string;
    userRole?: string;
    isJoined?: boolean;
    distance?: number;
    organizer?: {
        firstName: string;
        lastName: string;
    };
    isOrganizer?: boolean;
}

const CategoryIcon = ({ category }: { category?: string }) => {
    switch (category) {
        case 'Music': return <Music className="w-4 h-4" />;
        case 'Tech': return <Code className="w-4 h-4" />;
        case 'Sports': return <Trophy className="w-4 h-4" />;
        case 'Arts': return <Palette className="w-4 h-4" />;
        case 'Community': return <Users className="w-4 h-4" />;
        default: return <Info className="w-4 h-4" />;
    }
};

export default function Event({ id, title, desc, date, category, userRole, isJoined: initialJoined, distance, organizer, isOrganizer }: propTypes) {
    const [isJoined, setIsJoined] = useState(initialJoined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsJoined(initialJoined);
    }, [initialJoined]);

    const handleJoin = async () => {
        setIsLoading(true);
        try {
            const result = await joinEventAction(id);
            if (result.success) {
                setIsJoined(true);
            }
        } catch (error) {
            console.error("Failed to join event:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card group flex flex-col h-full animate-float">
            <div className="flex-1 space-y-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <Link href={`/events/${id}`} className="hover:underline decoration-primary/30 underline-offset-4">
                            <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {title}
                            </h3>
                        </Link>
                        {category && (
                            <div className="shrink-0 p-2 rounded-lg bg-white/5 text-primary border border-white/10 group-hover:border-primary/50 transition-colors" title={category}>
                                <CategoryIcon category={category} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span suppressHydrationWarning>
                                {(() => {
                                    const d = new Date(date);
                                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
                                })()}
                            </span>
                        </div>
                        {organizer && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span>by {organizer.firstName} {organizer.lastName}</span>
                            </div>
                        )}
                        {distance !== undefined && (
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <MapPin className="w-4 h-4" />
                                <span>{(distance / 1000).toFixed(1)}km away</span>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {desc}
                </p>
            </div>

            {!isOrganizer && (
                <div className="mt-8 flex items-center gap-3">
                    <Link
                        href={`/events/${id}`}
                        className="premium-button text-sm flex-1 flex items-center justify-center gap-2 py-2.5"
                    >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <SubmitButton
                        onClick={handleJoin}
                        disabled={isJoined}
                        isLoading={isLoading}
                        loadingText="Saving..."
                        className={`text-sm flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors ${isJoined ? 'opacity-70 cursor-default' : ''}`}
                    >
                        {isJoined ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Saved
                            </>
                        ) : (
                            "Save Event"
                        )}
                    </SubmitButton>
                </div>
            )}
        </div>
    );
}