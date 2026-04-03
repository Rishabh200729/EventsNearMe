"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as string;

  try {
      const response = await fetch(`${(process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000/api"}/auth/register`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, firstName, lastName, role }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
          return { error: data.error || "Registration failed" };
      }
      
      // set the cookie in the browser
      (await cookies()).set("auth_token", data.data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/"
      });
  } catch (err) {
      return { error: "Failed to connect to the server" };
  }

  return redirect("/");
}
