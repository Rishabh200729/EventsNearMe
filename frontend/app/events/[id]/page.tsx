'use client';
import useSWR from "swr";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { bookEventAction } from "@/actions/booking-action";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = ({params}:{params : Promise<{id : string}>}) => {
    const { id } = use(params);
    const router = useRouter();
    const { data, error, mutate } = useSWR(`/api/events/${id}`, fetcher);
    const [booking, setBooking] = useState<{ loading: boolean; message: string; success?: boolean }>({ loading: false, message: "" });

    const handleBook = async () => {
        setBooking({ loading: true, message: "" });
        const result = await bookEventAction(id);
        setBooking({ loading: false, message: result.message, success: result.success });
        if (result.success) {
            mutate();
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-6">
            <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
                Event Details
            </h1>
            {error && <p className="text-red-500">Failed to load event details</p>}
            {!data ? (
                <p className="text-gray-500">Loading event details...</p>
            ) : (
                <div className="w-full max-w-3xl border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold">{data.data.title}</h2>
                    <p className="text-sm text-gray-500">{new Date(data.data.date).toLocaleDateString()}</p>
                    <p className="text-gray-700">{data.data.description}</p>

                    <div className="flex items-center gap-4 text-sm border-t pt-4">
                        <span>Price: {data.data.price === 0 ? "Free" : `$${data.data.price}`}</span>
                        <span>Available: {data.data.availableSeats} / {data.data.capacity}</span>
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={booking.loading || data.data.availableSeats === 0}
                        className="premium-button w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {booking.loading ? "Booking..." : data.data.availableSeats === 0 ? "Sold Out" : "Book Now"}
                    </button>

                    {booking.message && (
                        <p className={`text-sm text-center ${booking.success ? "text-green-600" : "text-red-500"}`}>
                            {booking.message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
export default Page;
