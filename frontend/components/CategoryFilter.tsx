"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CategoryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val) {
            router.push(`/explore?category=${encodeURIComponent(val)}`);
        } else {
            router.push(`/explore`);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <label htmlFor="category" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Filter by Category
            </label>
            <select
                id="category"
                value={currentCategory}
                onChange={handleChange}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer"
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
