import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { Lucia } from "lucia";
import { SessionCollection, UserCollection } from "./db";
import { cache } from "react";
import { cookies } from "next/headers";

const adapter =  new MongodbAdapter(SessionCollection, UserCollection)

export const lucia = new Lucia(adapter,{
    sessionCookie:{
        attributes:{
            secure: process.env.NODE_ENV === "production"
        },
    },
    getUserAttributes : (attributes) =>{
        return {
            email : attributes.email,
            role : attributes.role
        }
    }
});

export  const validateRequest = cache(async(): Promise<{user : User ; session : Session} | { user : null; session : null}>=>{
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if(!sessionId){
        return {
            user : null,
            session : null
        }
    }
    const result =  await lucia.validateSession(sessionId);
    try {
        if(result.session && result.session.fresh){
            const sessionCookie = lucia.createBlankSessionCookie(result.session.id)
        }else {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(sessionCookie.name,sessionCookie.value, sessionCookie.attributes);

        }
    }catch(error){
        console.log(error) 
    }
    return result 
})

declare module 'lucia'{
    interface Register {
        Lucia : typeof lucia ;
    }
}