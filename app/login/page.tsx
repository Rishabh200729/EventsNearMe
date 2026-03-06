import { loginAction } from "@/actions/login-action"
import { LogIn } from "lucide-react";

export default function Login() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="glass-card w-full max-w-md space-y-8 animate-float">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-primary/20 text-primary mb-2">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight premium-gradient bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Please enter your details to sign in
                    </p>
                </div>

                <form action={loginAction} className="space-y-6">
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
                        Sign In
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                    <a href="/register" className="text-primary hover:underline font-medium">Create account</a>
                </div>
            </div>
        </div>
    )
}