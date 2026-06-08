"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Bell, ChevronDown, Compass, BookOpen, LayoutDashboard, Plus, CheckSquare, User, LogOut, Menu, X, Sparkles } from "lucide-react";
import { logout } from "@/actions/logout";
import { NotificationBadge } from "@/components/NotificationBadge";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email?: string; role: string } | null>(null);
  const [isOrganizerDropdownOpen, setIsOrganizerDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const organizerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser({
            name: data.data.firstName + " " + data.data.lastName,
            email: data.data.email,
            role: data.data.role,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (organizerRef.current && !organizerRef.current.contains(event.target as Node)) {
        setIsOrganizerDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on navigate
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 flex items-center transition-all duration-300">
      {/* Brand Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent group"
      >
        <Sparkles className="w-6 h-6 text-primary group-hover:animate-spin transition-all duration-500" />
        <span>EventsNearMe</span>
      </Link>

      {/* Desktop Main Navigation */}
      <div className="hidden md:flex items-center ml-10 gap-1.5">
        {user && (
          <>
            <Link
              href="/explore"
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 hover:bg-white/5 ${
                pathname === "/explore"
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link
              href="/my-bookings"
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 hover:bg-white/5 ${
                pathname === "/my-bookings"
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              My Bookings
            </Link>
          </>
        )}
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center ml-auto gap-4">
        {user ? (
          <>
            {/* Notifications */}
            <Link
              href="/notifications"
              className={`p-2.5 rounded-xl border transition-all relative ${
                pathname === "/notifications"
                  ? "text-primary bg-primary/10 border-primary/20"
                  : "text-muted-foreground hover:text-foreground bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <Bell className="w-5 h-5" />
              <NotificationBadge />
            </Link>

            {/* Organizer Quick Actions Portal */}
            {user.role === "organizer" && (
              <div className="relative hidden md:block" ref={organizerRef}>
                <button
                  onClick={() => setIsOrganizerDropdownOpen(!isOrganizerDropdownOpen)}
                  className="flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-primary/20 active:scale-95"
                >
                  Organizer Portal
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOrganizerDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isOrganizerDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-xl p-2 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Events Manager
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/10 rounded-xl transition-colors"
                      onClick={() => setIsOrganizerDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/create"
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/10 rounded-xl transition-colors"
                      onClick={() => setIsOrganizerDropdownOpen(false)}
                    >
                      <Plus className="w-4 h-4 text-pink-400" />
                      Create Event
                    </Link>
                    <Link
                      href="/organizer/checkin"
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/10 rounded-xl transition-colors"
                      onClick={() => setIsOrganizerDropdownOpen(false)}
                    >
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      Check In Attendees
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Logout Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl premium-gradient p-[1px] shadow-md shadow-primary/10">
                  <div className="w-full h-full bg-background rounded-[11px] flex items-center justify-center text-xs font-bold text-foreground">
                    {initials}
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground hidden sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3.5 w-64 glass rounded-2xl shadow-xl p-2 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || user.role}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/10 rounded-xl transition-colors"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 text-primary" />
                    My Profile
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/register" className="premium-button text-sm py-2">
              Register
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 glass border-b border-white/10 p-5 flex flex-col gap-4 animate-in slide-in-from-top duration-300 md:hidden">
          {user ? (
            <>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Member Links</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/explore"
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-white/5 ${pathname === "/explore" ? "text-primary bg-primary/10" : "text-foreground"}`}
                  >
                    <Compass className="w-4 h-4" />
                    Explore
                  </Link>
                  <Link
                    href="/my-bookings"
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-white/5 ${pathname === "/my-bookings" ? "text-primary bg-primary/10" : "text-foreground"}`}
                  >
                    <BookOpen className="w-4 h-4" />
                    My Bookings
                  </Link>
                </div>
              </div>

              {user.role === "organizer" && (
                <div className="pb-3 border-b border-white/5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-purple-400">Organizer Tools</p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-white/5 ${pathname === "/dashboard" ? "text-purple-400 bg-purple-400/10" : "text-foreground"}`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/create"
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-white/5 ${pathname === "/create" ? "text-pink-400 bg-pink-400/10" : "text-foreground"}`}
                    >
                      <Plus className="w-4 h-4 text-pink-400" />
                      Create Event
                    </Link>
                    <Link
                      href="/organizer/checkin"
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-white/5 ${pathname === "/organizer/checkin" ? "text-emerald-400 bg-emerald-400/10" : "text-foreground"}`}
                    >
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      Check In Attendees
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full text-center py-2.5 text-sm font-medium bg-white/5 border border-white/10 rounded-xl text-foreground hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2.5 text-sm font-medium premium-button"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
