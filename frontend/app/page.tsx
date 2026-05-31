import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import NearbyEvents from "@/components/NearbyEvents";

export default async function Home() {
  const user = await validateRequest();
  if (!user.user) {
    return redirect("/login");
  }

  return (
    <div className="space-y-12">
      <NearbyEvents user={user.user} />
    </div>
  );
}
