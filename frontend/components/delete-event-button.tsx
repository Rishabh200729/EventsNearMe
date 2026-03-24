"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteEventAction } from "../actions/delete-event-action";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteEventAction(eventId);
            alert("Event deleted successfully");
            // Refresh the page to see the updated events list
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
            className="flex items-center gap-2 ml-auto bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 disabled:bg-red-400 transition"
        >
            <Trash2 size={18} />
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}
