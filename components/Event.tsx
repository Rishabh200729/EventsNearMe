"use client";
import { Calendar, CheckCircle, Loader2, Music, Code, Users, Trophy, Palette, Info, MapPin } from "lucide-react";
import { useState } from "react";
import { joinEventAction } from "@/actions/rsvp-actions";

interface propTypes {
    id: string;
    name: string;
    desc: string;
    date: string;
    category?: string;
    userRole?: string;
    isJoined?: boolean;
    distance?: number;
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

export default function Event({ id, name, desc, date, category, userRole, isJoined: initialJoined, distance }: propTypes) {
    const [isJoined, setIsJoined] = useState(initialJoined);
    const [isLoading, setIsLoading] = useState(false);

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
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        {category && (
                            <div className="shrink-0 p-2 rounded-lg bg-white/5 text-primary border border-white/10 group-hover:border-primary/50 transition-colors" title={category}>
                                <CategoryIcon category={category} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
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

            {userRole === "Participator" && (
                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={handleJoin}
                        disabled={isJoined || isLoading}
                        className={`premium-button text-sm w-full flex items-center justify-center gap-2 ${isJoined ? 'opacity-70 cursor-default' : ''}`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isJoined ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Registered
                            </>
                        ) : (
                            "Join Event"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}