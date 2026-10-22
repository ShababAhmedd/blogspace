"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const icons = {
  dashboard: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  blogs: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z",
  create: "M12 4.5v15m7.5-7.5h-15",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  profile: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  password: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  logout: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
};

function Icon({ name }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name]} />
    </svg>
  );
}

const userItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/blogs", label: "My Blogs", icon: "blogs" },
  { href: "/dashboard/blogs/create", label: "Create Blog", icon: "create" },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  { href: "/dashboard/change-password", label: "Change Password", icon: "password" },
];

const adminItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/blogs", label: "All Blogs", icon: "blogs" },
  { href: "/dashboard/blogs/create", label: "Create Blog", icon: "create" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  { href: "/dashboard/change-password", label: "Change Password", icon: "password" },
];

// the most specific item whose path matches the current page is the active one
const findActive = (items, pathname) =>
  items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

export default function Sidebar({ open, onClose }) {
  const { isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const items = isAdmin ? adminItems : userItems;
  const active = findActive(items, pathname);

  return (
    <>
      <div
        className={`fixed inset-0 top-16 z-30 bg-slate-900/40 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed bottom-0 left-0 top-16 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Dashboard navigation"
      >
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {isAdmin && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Admin panel</p>
          )}
          {items.map((item) => {
            const isActive = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
