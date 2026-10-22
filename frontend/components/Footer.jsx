"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} BlogSpace. Share what you learn.</p>
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/" className="hover:text-slate-900">
            Blogs
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Start writing
          </Link>
          <Link href="/login" className="hover:text-slate-900">
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}
