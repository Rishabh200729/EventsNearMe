import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NearbyEvents from "@/components/NearbyEvents";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  let userId = "";
  let shouldRedirect = false;
  let errorMsg = "";

  try {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
    const res = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        Cookie: `auth_token=${token}`,
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      shouldRedirect = true;
      const errBody = await res.json().catch(() => null);
      const urlSource = process.env.INTERNAL_BACKEND_URL ? 'INTERNAL' : process.env.NEXT_PUBLIC_BACKEND_URL ? 'PUBLIC' : 'LOCALHOST_FALLBACK';
      errorMsg = `Status: ${res.status} | URL: ${urlSource} | Backend: ${errBody?.error || 'Unknown'} | Token: ${token.substring(0, 10)}...`;
    } else {
      const data = await res.json();
      userId = data.data?._id || data.data?.id || "";
    }
  } catch (err: any) {
    shouldRedirect = true;
    errorMsg = err.message || "Network Error";
  }

  if (shouldRedirect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-bold tracking-tight text-white">Session Expired</h2>
        <p className="text-muted-foreground">Your authentication token is no longer valid. ({errorMsg})</p>
        <a href="/login" className="premium-button px-6 py-3 font-medium">
          Log In Again
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <NearbyEvents user={{ id: userId, name: "", email: "", role: "" }} />
    </div>
  );
}
