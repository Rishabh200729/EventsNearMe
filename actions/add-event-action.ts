'use server';
import { cookies } from "next/headers";
import { SessionCollection } from "@/lib/db";
import { EventCollection } from "@/lib/db";
import { generateIdFromEntropySize } from "lucia";

export async function addEventAction(formData: FormData) {
    const cookieStore = await cookies();

    const name = formData.get("name") as string;
    const desc = formData.get("desc") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;

    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;

    const currentSession = cookieStore.get("auth_session")?.value;
    const existingSessionFromDB = await SessionCollection.findOne({
        _id: currentSession,
    });
    const userId = existingSessionFromDB?.user_id;

    if (!userId) {
        throw new Error("User session not found");
    }

    await EventCollection.insertOne({
        _id: generateIdFromEntropySize(10),
        userId,
        name: name,
        description: desc,
        date: date,
        category: category,
        location: lat && lng ? {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
        } : undefined,
        organizerId: userId
    });
}