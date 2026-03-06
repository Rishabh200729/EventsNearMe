'use server';

import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logout = async (formData: FormData) => {
    const { user, session } = await validateRequest();
    console.log("the user that is being logged out is  ", user);
    if (!session) {
        return redirect('/login');
    }
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );

    return redirect('/login');
}