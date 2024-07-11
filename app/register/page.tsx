"use client";
import { useState } from "react";
import Navbar from "../Navbar";
import { signUpAction } from "@/actions/signup-actions";

export default function Page() {

  const handleClick = (e) => {
    console.log(e.target.name)
  };
  return (
    <>
      <form action={signUpAction} className="my-5">
        <div className=" grid gap-2 place-content-center text-center ">
          <h1 className="text-4xl justify-self-center">Register</h1>

          <div className="">
            <label className="mb-2 text-sm font-medium ">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              className="focus:outline-none border-2 border-indigo-200 border-t-indigo-500 w-full p-2.5"
              placeholder="abc@gmail.com"
              required
            />
          </div>
          <div>
            <label className=" mb-2 text-sm font-medium ">Password</label>
            <input
              type="text"
              id="password"
              name="password"
              className="focus:outline-none border-2 border-indigo-200 border-t-indigo-500  w-full p-2.5 "
              placeholder="Password"
              required
            />
          </div>
          <div>
            <label className=" mb-2 text-sm font-medium">Name</label>
            <input
              type="text"
              id="name"
              name="username"
              className="focus:outline-none border-2 border-indigo-200 border-t-indigo-500  w-full p-2.5 "
              placeholder="John Doe"
              required
            />
          </div>
          <label htmlFor="roles">Choose your Role:</label>

          <select name="role" id="roles">
            <option value="Participator" onClick={handleClick}>Participator</option>
            <option value="Creator"onClick={handleClick}>Creator</option>
          </select>
          <button
            type="submit"
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded text-sm px-2 py-2 text-center"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
