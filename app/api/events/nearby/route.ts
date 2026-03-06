import { NextRequest, NextResponse } from "next/server";
import { EventCollection } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get("lat") || "");
        const lng = parseFloat(searchParams.get("lng") || "");
        const radius = parseFloat(searchParams.get("radius") || "5000"); // default 5km

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json({ error: "Invalid coordinates provided." }, { status: 400 });
        }

        // Use $geoNear to get distance and results sorted by proximity
        const nearbyEvents = await EventCollection.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [lng, lat] },
                    distanceField: "distance",
                    maxDistance: radius,
                    spherical: true
                }
            },
            { $limit: 50 }
        ]).toArray();

        return NextResponse.json(nearbyEvents);
    } catch (error) {
        console.error("Geospatial fetch failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
