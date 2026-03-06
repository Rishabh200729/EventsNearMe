import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { Lucia, Session, User } from "lucia";
import { SessionCollection, UserCollection } from "./db";
import { cache } from "react";
import { cookies } from "next/headers";

const adapter = new MongodbAdapter(SessionCollection as any, UserCollection as any)

interface DatabaseUser {
    email: string;
    role: string;
}

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production"
        },
    },
    getUserAttributes: (attributes: any) => {
        return {
            email: attributes.email as string,
            role: attributes.role as string
        }
    }
});

export const validateRequest = cache(async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null
        }
    }
    const result = await lucia.validateSession(sessionId);
    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id)
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
    } catch (error) {
        console.log(error)
    }
    return result
})

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUser;
    }
}