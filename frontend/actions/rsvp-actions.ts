'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function joinEventAction(eventId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        throw new Error("You must be logged in to join an event.");
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"}/events/${eventId}/bookmark`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (!response.ok || !data.success) {
            return { success: false, message: data.error || "Failed to join event." };
        }
    } catch (e) {
        return { success: false, message: "Network error occurred." };
    }

    revalidatePath("/");
    return { success: true, message: "Successfully joined the event!" };
}
