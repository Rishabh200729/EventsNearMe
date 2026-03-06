import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import { AppWrapper } from "@/app/Context/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventsNearMe | Discover & Create Local Events",
  description: "A premium platform for local community engagement and event discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <AppWrapper>
        <body className={`${inter.className} min-h-screen`}>
          <Navbar />
          <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
            {children}
          </main>
        </body>
      </AppWrapper>
    </html>
  );
}
