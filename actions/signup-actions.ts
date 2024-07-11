"use server";
import { lucia } from "@/lib/auth";
import { UserCollection } from "../lib/db";
import argon2 from "argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  console.log("this is the data recieved",formData);
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("username") as string ;
  const role = formData.get("role") as string;
  // hash the password
  const passwordHash = await argon2.hash(password, {
    memoryCost: 19485,
    timeCost: 2,
  });
  const userId = generateIdFromEntropySize(10);
  console.log(passwordHash);

  // add the user to UserCollection
  await UserCollection.insertOne({
    _id: userId,
    name ,
    email,
    password: passwordHash,
    role,
  });
  // create the session
  const session = await lucia.createSession(userId,{})

  // set the cookie in the browser
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies().set(sessionCookie.name,sessionCookie.value, sessionCookie.attributes);

  // redirect to home
  return redirect("/login")  
}
