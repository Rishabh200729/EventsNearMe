"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialCategory = searchParams.get("category") || "";
    const initialSearch = searchParams.get("q") || "";

    const [category, setCategory] = useState(initialCategory);
    const [search, setSearch] = useState(initialSearch);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Debounce search updates
    useEffect(() => {
        if (!isMounted) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            if (search) params.set("q", search);
            
            const queryString = params.toString() ? `?${params.toString()}` : "";
            router.push(`/explore${queryString}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [category, search, router, isMounted]);

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events, organizers, tags..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                />
            </div>
            
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer"
            >
                <option value="" className="text-black">All Categories</option>
                <option value="tech" className="text-black">Tech</option>
                <option value="music" className="text-black">Music</option>
                <option value="sports" className="text-black">Sports</option>
                <option value="arts" className="text-black">Arts</option>
                <option value="community" className="text-black">Community</option>
            </select>
        </div>
    );
}
