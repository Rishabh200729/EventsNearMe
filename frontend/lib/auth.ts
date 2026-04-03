import { cookies } from "next/headers";

export async function validateRequest() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return { user: null, session: null };
    }

    try {
        const response = await fetch(`${(process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000/api"}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: 'no-store'
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return {
                user: {
                    id: data.data._id || data.data.id,
                    name: data.data.firstName + " " + data.data.lastName,
                    email: data.data.email,
                    role: data.data.role
                },
                session: { id: "mock_session_id" }
            };
        }
    } catch (e) {
        console.error("Auth validation failed", e);
    }

    return { user: null, session: null };
}
