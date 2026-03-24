import Link from "next/link";
import { logout } from "@/actions/logout";
import { validateRequest } from "@/lib/auth";

export default async function Navbar() {
  const { user } = await validateRequest();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex items-center transition-all duration-300">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent"
      >
        EventsNearMe
      </Link>

      <div className="flex items-center ml-auto gap-6">
        {user && user.role === "organizer" && (
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        )}
        {user ? (
          <>
            {/* Redundant link removed */}
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
