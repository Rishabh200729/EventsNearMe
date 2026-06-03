import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NearbyEvents from "@/components/NearbyEvents";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  let userId = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.id || payload._id || "";
  } catch {}

  return (
    <div className="space-y-12">
      <NearbyEvents user={{ id: userId, name: "", email: "", role: "" }} />
    </div>
  );
}
