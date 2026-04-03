'use server';
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addEventAction(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        throw new Error("User session not found");
    }

    const name = formData.get("name") as string;
    const desc = formData.get("desc") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;

    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;

    const payload = {
        title: name,
        description: desc,
        date,
        category: category.toLowerCase(),
        location: lat && lng ? {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
        } : undefined,
        capacity: 100, // Or whatever default is expected
        availableSeats: 100,
        price: 0
    };

    const response = await fetch(`${(process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000/api"}/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
    }

    revalidatePath("/", "page");
}