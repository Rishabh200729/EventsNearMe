"use server";

import { cookies } from "next/headers";

export async function deleteEventAction(eventId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    try {
        const backendUrl = (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/events/${eventId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to delete event");
        }

        return { success: true };
    } catch (error) {
        console.error("Delete event error:", error);
        throw error;
    }
}
