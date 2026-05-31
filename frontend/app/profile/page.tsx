import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Shield } from "lucide-react";

export default async function ProfilePage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  // Safely extract initials from the combined name string
  const nameParts = user.name?.split(" ") || [];
  const initials = `${nameParts[0]?.[0] || ""}${nameParts[nameParts.length - 1]?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20 text-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account details</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 cursor-default transition-transform hover:scale-105 duration-300">
            {initials}
          </div>
          <h3 className="text-2xl font-bold tracking-tight">{user.name}</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            {user.role}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 transition-colors hover:bg-white/10">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Full Name</p>
              <p className="font-semibold text-foreground text-lg">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 transition-colors hover:bg-white/10">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Email Address</p>
              <p className="font-semibold text-foreground text-lg">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
