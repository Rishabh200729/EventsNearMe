import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventFeed from "@/components/EventFeed";
import CategoryFilter from "@/components/CategoryFilter";
import { Info } from "lucide-react";

export default async function Explore({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const user = await validateRequest();
  if (!user.user) {
    return redirect("/login");
  }

  // Parse the generic search params using Next.js 15+ patterns
  const params = await searchParams;
  const selectedCategory = params?.category;

  // Fetch from the Express backend API
  const baseUrl = (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000/api";
  const url = selectedCategory
    ? `${baseUrl}/events?category=${encodeURIComponent(selectedCategory)}`
    : `${baseUrl}/events`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  const events = data.success ? data.data : [];

  const rsvps: any[] = []; // Defaulting to empty until backend supports RSVP aggregation
  return (
    <div className="space-y-12">
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">View all Events</h1>
          <CategoryFilter />
        </div>

        {events.length === 0 ? (
          <div className="glass-card text-center py-20">
            <p className="text-muted-foreground">No events found at the moment.</p>
          </div>
        ) : (
          <EventFeed initialEvents={events} rsvps={rsvps} user={user.user} />
        )}
      </section>
    </div>
  );
}
