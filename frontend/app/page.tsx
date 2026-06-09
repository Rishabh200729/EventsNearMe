import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NearbyEvents from "@/components/NearbyEvents";
import { getBackendUrl } from "@/lib/backend-url";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  let userId = "";
  let shouldRedirect = false;
  let errorMsg = "";

  try {
    const backendUrl = getBackendUrl();

    // Debug: Check what headers actually arrive at the backend
    const debugRes = await fetch(`${backendUrl}/debug/headers`, {
      headers: {
        Cookie: `auth_token=${token}`,
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    const debugData = await debugRes.json().catch(() => ({ error: 'debug fetch failed' }));

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
      errorMsg = `Status: ${res.status} | Auth: ${debugData.hasAuth} | Cookie: ${debugData.hasCookie} | Headers: ${JSON.stringify(debugData.allHeaderKeys)} | Backend: ${errBody?.error || 'Unknown'}`;
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
