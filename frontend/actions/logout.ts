'use server';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logout = async (formData: FormData) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"}/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error("Logout error", e);
        }
    }

    // Delete the JWT cookie
    cookieStore.delete("auth_token");
    return redirect('/login');
}