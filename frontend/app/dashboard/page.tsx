import { Trash2 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DeleteEventButton from "../../components/delete-event-button";

async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        redirect("/login");
    }

    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
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
                <div className="flex flex-col items-center min-h-screen p-6">
                    <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
                        Dashboard
                    </h1>
                    <div className="w-full max-w-3xl border border-slate-200 rounded-2xl p-6">
                        <p className="text-gray-500">Failed to load events</p>
                    </div>
                </div>
            );
        }

        const data = await res.json();
        const events = data?.data || [];

        return (
            <div className="flex flex-col items-center min-h-screen p-6">

                <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
                    Dashboard
                </h1>

                <div className="w-full max-w-3xl border border-slate-200 rounded-2xl p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        View Your Events
                    </h2>

                    {events.length === 0 ? (
                        <p className="text-gray-500">No events found</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {events.map((event: any) => (
                                <div
                                    key={event._id}
                                    className="border border-slate-300 rounded-xl p-4 shadow-sm"
                                >
                                    <p className="font-semibold text-lg">
                                        {event.title}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {event.date}
                                    </p>

                                    <p className="mt-2 text-gray-700">
                                        {event.description}
                                    </p>
                                    <DeleteEventButton eventId={event._id} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return (
            <div className="flex flex-col items-center min-h-screen p-6">
                <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
                    Dashboard
                </h1>
                <div className="w-full max-w-3xl border border-slate-200 rounded-2xl p-6">
                    <p className="text-gray-500">Failed to load events. Please try again later.</p>
                </div>
            </div>
        );
    }
}

export default Page;