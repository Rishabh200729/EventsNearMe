'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function bookEventAction(eventId: string, quantity: number = 1) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return { success: false, message: "You must be logged in to book an event." };
    }

    try {
        const apiUrl = `${process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"}/bookings/events/${eventId}`;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            return { success: false, message: data.error || "Failed to book event." };
        }
    } catch (e) {
        return { success: false, message: "Network error occurred." };
    }

    revalidatePath(`/events/${eventId}`);
    return { success: true, message: "Booking confirmed! Check your email for details." };
}
