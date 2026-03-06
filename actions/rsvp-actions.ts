'use server';

import { cookies } from "next/headers";
import { SessionCollection, RSVPCollection } from "@/lib/db";
import { generateIdFromEntropySize } from "lucia";
import { revalidatePath } from "next/cache";

export async function joinEventAction(eventId: string) {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("auth_session")?.value;

    if (!sessionId) {
        throw new Error("You must be logged in to join an event.");
    }

    const session = await SessionCollection.findOne({ _id: sessionId });
    if (!session) {
        throw new Error("Invalid session.");
    }

    const userId = session.user_id;

    // Check if already joined
    const existingRSVP = await RSVPCollection.findOne({ eventId, userId });
    if (existingRSVP) {
        return { success: false, message: "You have already joined this event." };
    }

    await RSVPCollection.insertOne({
        _id: generateIdFromEntropySize(10),
        eventId,
        userId,
        timestamp: new Date()
    });

    revalidatePath("/");
    return { success: true, message: "Successfully joined the event!" };
}
