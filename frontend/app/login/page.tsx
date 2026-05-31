"use client";
import { loginAction } from "@/actions/login-action"
import SubmitButton from "@/components/SubmitButton";

export default function Login() {
    const handler = async (formData: FormData) => {
        const result = await loginAction(formData);
        if (result?.error) {
            alert(result.error);
        }
    }

    const fillDemo = (email: string, password: string) => {
        const form = document.getElementById('login-form') as HTMLFormElement;
        (form.elements.namedItem('email') as HTMLInputElement).value = email;
        (form.elements.namedItem('password') as HTMLInputElement).value = password;
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="glass-card w-full max-w-md space-y-8 animate-float">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight premium-gradient bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Please enter your details to sign in
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Demo Accounts</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => fillDemo('demo@eventsnearme.com', 'demo1234')}
                            className="text-left px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                            <p className="text-sm font-medium text-foreground">👤 Demo User</p>
                            <p className="text-xs text-muted-foreground truncate">demo@eventsnearme.com</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('organizer@eventsnearme.com', 'demo1234')}
                            className="text-left px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                            <p className="text-sm font-medium text-foreground">🎪 Demo Organizer</p>
                            <p className="text-xs text-muted-foreground truncate">organizer@eventsnearme.com</p>
                        </button>
                    </div>
                </div>

                <form id="login-form" action={handler} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
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
                            autoComplete="current-password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <SubmitButton type="submit" loadingText="Signing In..." className="premium-button w-full py-4 text-lg font-semibold">
                        Sign In
                    </SubmitButton>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                    <a href="/register" className="text-primary hover:underline font-medium">Create account</a>
                </div>
            </div>
        </div>
    )
}