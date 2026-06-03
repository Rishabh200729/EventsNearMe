"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteEventAction } from "../actions/delete-event-action";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Delete this event? All bookings will be cancelled.")) return;
        setIsDeleting(true);
        try {
            await deleteEventAction(eventId);
            window.location.reload();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete event");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
            {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}
