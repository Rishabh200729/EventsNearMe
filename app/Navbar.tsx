'use client'
import { useAppContext } from "./Context/store";
import Link from "next/link";

export default function Navbar() {
  const {value,setValue} = useAppContext();
  console.log(value);
  return (
    <nav className="flex justify-evenly space-x-3 bg-amber-500 p-4">
        <Link href= "/" className="text-black text-4xl">App</Link>
        <Link href="/login" className="text-white text-xl bg-blue-600 rounded-lg px-3 py-1 ">Login</Link>
        <Link href="/register" className="text-white text-xl bg-blue-600 rounded-lg px-3 py-1 ">Register</Link>
    </nav>
  );
}

