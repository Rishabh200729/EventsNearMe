"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBackendUrl } from "@/lib/backend-url";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const response = await fetch(`${getBackendUrl()}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return { error: data.error || "Invalid details" };
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
