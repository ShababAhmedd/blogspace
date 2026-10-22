"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "./Button";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "./SearchBar";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileSearch, setMobileSearch] = useState(false);

  const onHome = pathname === "/";
  const title = onHome ? searchParams.get("title") || "" : "";

  // on the homepage results update as you type; elsewhere Enter takes you to the results
  const handleSearch = (value) => {
    const params = new URLSearchParams(onHome ? searchParams.toString() : "");
    if (value.trim()) params.set("title", value.trim());
    else params.delete("title");
    const query = params.toString();
    const url = query ? `/?${query}` : "/";
    if (onHome) router.replace(url, { scroll: false });
    else router.push(url);
  };

  const search = (id) => (
    <SearchBar name={id} value={title} onSearch={handleSearch} autoSearch={onHome} placeholder="Search blogs..." />
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <Logo />

        <div className="mx-auto hidden w-full max-w-md md:block">{search("navbar-search")}</div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => setMobileSearch((value) => !value)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle search"
            aria-expanded={mobileSearch}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 sm:w-32" aria-hidden="true" />
          ) : isAuthenticated ? (
            <>
              {!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin") && (
                <Button href="/dashboard" variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
              )}
              <ProfileMenu />
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button href="/register" size="sm">
                Register
              </Button>
            </>
          )}
        </div>
      </div>
      {mobileSearch && <div className="border-t border-slate-100 px-4 py-3 md:hidden">{search("mobile-search")}</div>}
    </header>
  );
}
