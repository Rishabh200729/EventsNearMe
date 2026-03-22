import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Participator from "@/components/Participator";
import EventFeed from "@/components/EventFeed";
import SideBar from "@/components/SideBar";
import NearbyEvents from "@/components/NearbyEvents";
import { Info } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const user = await validateRequest();
  if (!user.user) {
    return redirect("/login");
  }

  const { category: selectedCategory } = await searchParams;

  // Fetch from the Express backend API
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
  const url = selectedCategory
    ? `${baseUrl}/events?category=${selectedCategory}`
    : `${baseUrl}/events`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  const events = data.success ? data.data : [];
  console.log("Events", events)
  const rsvps: any[] = []; // Defaulting to empty until backend supports RSVP aggregation

  return (
    <div className="space-y-12">
      <NearbyEvents initialEvents={events} />

      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-500">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Global Explorer</h2>
            <p className="text-sm text-muted-foreground">Browse all community events from around the world</p>
          </div>
        </div>

        <EventFeed initialEvents={events} rsvps={rsvps} user={user.user} />
      </section>
    </div>
  );
}
