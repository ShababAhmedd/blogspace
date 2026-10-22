import { Suspense } from "react";
import { Geist } from "next/font/google";
import Loader from "@/components/Loader";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "BlogSpace",
  description: "Discover, read and write blogs on testing, automation, programming, DevOps and AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {/* pages read the URL and the browser-stored session, so they render on the client */}
        <Suspense fallback={<Loader fullPage />}>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </Suspense>
      </body>
    </html>
  );
}
