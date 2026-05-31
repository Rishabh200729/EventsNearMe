import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Creator from "@/components/Creator";

export default async function CreateEventPage() {
  const user = await validateRequest();
  
  if (!user.user) {
    return redirect("/login");
  }

  if (user.user.role !== "organizer") {
    return redirect("/");
  }

  return (
    <div className="space-y-12">
      <section className="max-w-4xl mx-auto space-y-8">
        <Creator user={{ id: user.user.id, email: user.user.email, role: user.user.role }} />
      </section>
    </div>
  );
}
