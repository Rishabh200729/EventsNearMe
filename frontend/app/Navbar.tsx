"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { logout } from "@/actions/logout";
import { NotificationBadge } from "@/components/NotificationBadge";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser({
            name: data.data.firstName + " " + data.data.lastName,
            role: data.data.role,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex items-center transition-all duration-300">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent"
      >
        EventsNearMe
      </Link>

      <div className="flex items-center ml-auto gap-6">
        {user && (
          <>
            <Link
              href="/explore"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/my-bookings"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/notifications"
              className="text-sm font-medium hover:text-primary transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <NotificationBadge />
            </Link>
          </>
        )}
        {user && user.role === "organizer" && (
          <>
            <Link
              href="/create"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Create Event
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/organizer/checkin"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Check In
            </Link>
          </>
        )}
        {user ? (
          <>
            <Link
              href="/profile"
              className="text-sm font-medium hover:text-primary transition-colors pr-2"
            >
              Profile
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors group flex items-center gap-2"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/register" className="premium-button text-sm py-2">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
