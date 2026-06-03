import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EventFeed from "@/components/EventFeed";
import CategoryFilter from "@/components/CategoryFilter";

export default async function Explore({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  const params = await searchParams;
  const selectedCategory = params?.category;
  const baseUrl = (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000/api";

  const [eventsRes, bookingsRes] = await Promise.all([
    fetch(selectedCategory ? `${baseUrl}/events?category=${encodeURIComponent(selectedCategory)}` : `${baseUrl}/events`, { cache: 'no-store' }),
    fetch(`${baseUrl}/bookings`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }).catch(() => null),
  ]);

  const eventsData = await eventsRes.json();
  const events = eventsData.success ? eventsData.data : [];

  let bookedEventIds = new Set<string>();
  if (bookingsRes && bookingsRes.ok) {
    const bookingsData = await bookingsRes.json();
    if (bookingsData.success) {
      bookedEventIds = new Set(bookingsData.data.map((b: any) => b.eventId));
    }
  }

  const filteredEvents = events.filter((e: any) => !bookedEventIds.has(e._id));

  // Decode user id from JWT without verification (already trusted from backend)
  let userId = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.id || payload._id || "";
  } catch {}
  const user = { id: userId, name: "", email: "", role: "" };

  return (
    <div className="space-y-12">
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">View all Events</h1>
          <CategoryFilter />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="glass-card text-center py-20">
            <p className="text-muted-foreground">No events found at the moment.</p>
          </div>
        ) : (
          <EventFeed initialEvents={filteredEvents} rsvps={[]} user={user} />
        )}
      </section>
    </div>
  );
}
