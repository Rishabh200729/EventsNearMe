"use client";
import { UserPlus } from "lucide-react";
import { signUpAction } from "@/actions/signup-actions";

export default function Register() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="glass-card w-full max-w-lg space-y-8 animate-float">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/20 text-primary mb-2">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight premium-gradient bg-clip-text text-transparent">
            Join the Community
          </h1>
          <p className="text-muted-foreground text-sm">
            Create an account to start exploring or hosting events
          </p>
        </div>

        <form action={signUpAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <input
                type="text"
                name="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <select
                name="role"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground appearance-none cursor-pointer"
              >
                <option value="Participator" className="bg-background">Participator</option>
                <option value="Creator" className="bg-background">Creator</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              name="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="premium-button w-full py-4 text-lg font-semibold">
            Create Account
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <a href="/login" className="text-primary hover:underline font-medium">Log in</a>
        </div>
      </div>
    </div>
  );
}
