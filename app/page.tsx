import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Participator from "@/components/Participator";
import Creator from "@/components/Creator";
import { findEventsFromUserID } from "@/lib/db";
import Event from "@/components/Event";
import SideBar from "@/components/SideBar";
import NearbyEvents from "@/components/NearbyEvents";
import { Info } from "lucide-react";
export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const user = await validateRequest();
  const { category: selectedCategory } = await searchParams;
  const data = await findEventsFromUserID(selectedCategory);

  if (!user.user) {
    return redirect("/login");
  }

  return (
    <div className="space-y-12">
      <NearbyEvents initialEvents={data.events} />

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

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.events.map((event: any) => (
            <Event
              key={event._id}
              id={event._id}
              name={event.name}
              desc={event.description}
              date={event.date}
              category={event.category}
              userRole={user.user?.role}
              isJoined={data.rsvps.some((r: any) => r.eventId === event._id && r.userId === user.user?.id)}
            />
          ))}
        </section>
      </section>

      <section className="mt-12 border-t border-white/5 pt-12">
        {user.user.role === "Creator" && (
          <Creator user={user.user} />
        )}
      </section>
    </div>
  );
}
