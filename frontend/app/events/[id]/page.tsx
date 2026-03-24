'use client';
import useSWR from "swr";
import { use} from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = ({params}:{params : Promise<{id : string}>}) => {
    const { id } = use(params);
    const { data, error } = useSWR(`/api/events/${id}`, fetcher);
    console.log(data)
    return (
        <div className="flex flex-col items-center min-h-screen p-6">
            <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent mb-6">
                Event Details
            </h1>
            {error && <p className="text-red-500">Failed to load event details</p>}
            {!data ? (
                <p className="text-gray-500">Loading event details...</p>
            ) : (
                <div className="w-full max-w-3xl border border-slate-200 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {data.data.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {new Date(data.data.date).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-700">
                        {data.data.description}
                    </p>
                </div>
            )}

        </div>
    );
};
export default Page;