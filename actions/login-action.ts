"use server";
import { lucia } from "@/lib/auth";
import { UserCollection } from "@/lib/db";
import argon2 from "argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // check if user exists
    const existingUser = await UserCollection.findOne({
        email,
    });
    if (!existingUser) {
        return {
            error: "Invalid details",
        };
    }
    // verify the password
    const validPassword = await argon2.verify(existingUser.password, password, {
        memoryCost: 19485,
        timeCost: 2,
    });
    if (!validPassword) {
        return {
            error: "Invalid details",
        };
    }
    // create the session
    const session = await lucia.createSession(existingUser._id, {});

    // set the cookie in the browser
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );

    // redirect to home
    return redirect("/");
}
