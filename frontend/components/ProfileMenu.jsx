"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { capitalize, getFullName } from "@/utils/format";

export default function ProfileMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/change-password", label: "Change Password" },
    ...(isAdmin ? [{ href: "/admin/users", label: "Users" }] : []),
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100 sm:pr-3"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-700 sm:block">{getFullName(user)}</span>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{getFullName(user)}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <span className="mt-1 inline-block rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">
                {capitalize(user.role)}
              </span>
            </div>
          </div>
          <div className="py-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} role="menuitem" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
