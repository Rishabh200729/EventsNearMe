import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, DollarSign, Plus, Eye, Music, Code, Trophy, Palette, User, Info, MapPin, ArrowRight, Camera } from "lucide-react";
import DeleteEventButton from "../../components/delete-event-button";

const categoryIcons: Record<string, { icon: any; label: string }> = {
  community: { icon: User, label: 'Community' },
  music: { icon: Music, label: 'Music' },
  tech: { icon: Code, label: 'Tech' },
  sports: { icon: Trophy, label: 'Sports' },
  art: { icon: Palette, label: 'Art' },
  food: { icon: Info, label: 'Food' },
  business: { icon: Info, label: 'Business' },
  education: { icon: Info, label: 'Education' },
};

async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab || "active";
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const backendUrl = (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/events/organizer/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return (
        <div className="min-h-screen p-6 pt-24 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
            Dashboard
          </h1>
          <div className="glass-card text-center py-20">
            <p className="text-muted-foreground">Failed to load events</p>
          </div>
        </div>
      );
    }

    const data = await res.json();
    const events = data?.data || [];

    const activeEvents = events.filter((e: any) => e.status !== 'completed');
    const pastEvents = events.filter((e: any) => e.status === 'completed');
    const displayedEvents = currentTab === "past" ? pastEvents : activeEvents;

    const totalEvents = events.length;
    const totalSold = events.reduce((sum: number, e: any) => sum + (e.capacity - e.availableSeats), 0);
    const totalRevenue = events.reduce((sum: number, e: any) => sum + (e.capacity - e.availableSeats) * e.price, 0);

    return (
      <div className="min-h-screen p-6 pt-24 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex gap-3">
            <Link href="/create" className="premium-button text-sm py-2.5 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
            <Link href="/explore" className="text-sm py-2.5 px-5 rounded-xl bg-white/5 border border-white/10 text-foreground font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Explore
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card py-5 px-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEvents}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
          </div>
          <div className="glass-card py-5 px-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSold}</p>
              <p className="text-sm text-muted-foreground">Tickets Sold</p>
            </div>
          </div>
          <div className="glass-card py-5 px-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalRevenue}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
            <h2 className="text-lg font-semibold text-muted-foreground">Your Events</h2>
            <div className="flex gap-4">
              <Link
                href="/dashboard?tab=active"
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  currentTab === "active"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Active ({activeEvents.length})
              </Link>
              <Link
                href="/dashboard?tab=past"
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  currentTab === "past"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Past ({pastEvents.length})
              </Link>
            </div>
          </div>

          {displayedEvents.length === 0 ? (
            <div className="glass-card text-center py-20">
              <div className="p-4 rounded-full bg-primary/10 text-primary w-fit mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground text-lg mb-1">No events yet</p>
              <p className="text-muted-foreground text-sm mb-6">Create your first event to get started</p>
              <Link href="/create" className="premium-button inline-flex items-center gap-2 py-3 px-6">
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            </div>
          ) : (
            displayedEvents.map((event: any) => {
              const cat = categoryIcons[event.category?.toLowerCase()] || categoryIcons.community;
              const CatIcon = cat.icon;
              const sold = event.capacity - event.availableSeats;
              const pct = event.capacity > 0 ? Math.round((sold / event.capacity) * 100) : 0;

              return (
                <div key={event._id} className="glass-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs shrink-0">
                          <span className={`px-2.5 py-1 rounded-full font-medium ${
                            pct >= 100 ? 'bg-red-500/10 text-red-400' :
                            pct >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {sold} / {event.capacity} booked
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100 ? 'bg-red-500' :
                            pct >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                        {event.location?.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location.address}
                          </span>
                        )}
                        <span>${event.price} per ticket</span>
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                        <Link
                          href={`/events/${event._id}`}
                          className="premium-button text-sm flex items-center gap-2 py-2 px-4"
                        >
                          View Event
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {event.status !== 'completed' && (
                          <>
                            <Link
                              href={`/organizer/checkin?eventId=${event._id}`}
                              className="text-sm py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                              <Camera className="w-4 h-4" />
                              Check In
                            </Link>
                            <Link
                              href={`/organizer/waitlist?eventId=${event._id}`}
                              className="text-sm py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Waitlist
                            </Link>
                            <DeleteEventButton eventId={event._id} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return (
      <div className="min-h-screen p-6 pt-24 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
          Dashboard
        </h1>
        <div className="glass-card text-center py-20">
          <p className="text-muted-foreground">Failed to load events. Please try again later.</p>
        </div>
      </div>
    );
  }
}

export default Page;
