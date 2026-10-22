"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import CategoryBadge from "@/components/CategoryBadge";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import blogService from "@/services/blog.service";
import userService from "@/services/user.service";
import { getErrorMessage } from "@/utils/api";
import { capitalize, formatDate, getFullName } from "@/utils/format";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function DashboardView() {
  usePageTitle("Dashboard");
  const { user, isAdmin } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const requests = [blogService.getBlogs(), isAdmin ? userService.getUsers() : Promise.resolve(null)];
    Promise.all(requests)
      .then(([blogData, userData]) => {
        if (ignore) return;
        setBlogs(blogData);
        setUsers(userData);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err, "Could not load dashboard data.")))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const myBlogs = blogs.filter((blog) => blog.author?.id === user.id);
  const recent = (isAdmin ? blogs : myBlogs).slice(0, 5);
  const myCategories = new Set(myBlogs.map((blog) => blog.category));

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-brand-100">{formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Welcome, {user.firstName}!</h1>
          <p className="mt-1 text-sm text-brand-100">
            {isAdmin ? "Manage users and every blog on BlogSpace." : "Here's what's happening with your blogs."}
          </p>
        </div>
        <Button href="/dashboard/blogs/create" variant="secondary" className="shrink-0 border-transparent">
          + Create Blog
        </Button>
      </div>

      <Alert className="mb-6">{error}</Alert>

      {loading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            <StatCard label="My Blogs" value={myBlogs.length} hint="Blogs you have published" />
            {isAdmin ? (
              <>
                <StatCard label="Total Blogs" value={blogs.length} hint="Across all authors" />
                <StatCard label="Total Users" value={users?.length ?? "—"} hint="Registered accounts" />
                <StatCard
                  label="Active Users"
                  value={users ? users.filter((u) => u.isActive).length : "—"}
                  hint={users ? `${users.filter((u) => !u.isActive).length} inactive` : undefined}
                />
              </>
            ) : (
              <>
                <StatCard label="Categories" value={myCategories.size} hint="Topics you've written about" />
                <StatCard
                  label="Latest Post"
                  value={myBlogs[0] ? formatDate(myBlogs[0].createdAt, { month: "short", day: "numeric" }) : "—"}
                  hint={myBlogs[0] ? formatDate(myBlogs[0].createdAt, { year: "numeric" }) : "Nothing published yet"}
                />
              </>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="font-semibold text-slate-900">{isAdmin ? "Recent Blogs" : "My Recent Blogs"}</h2>
                <Link href="/dashboard/blogs" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View all
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="You haven't created any blogs yet."
                    description="Share your first article with the community."
                    action={<Button href="/dashboard/blogs/create">Create your first blog</Button>}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((blog) => (
                    <li key={blog.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <Link href={`/blogs/${blog.id}`} className="block truncate font-medium text-slate-900 hover:text-brand-700">
                          {blog.blogTitle}
                        </Link>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <CategoryBadge category={blog.category} />
                          <span>{formatDate(blog.createdAt)}</span>
                          {isAdmin && <span>· by {getFullName(blog.author)}</span>}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/blogs/${blog.id}/edit`}
                        className="shrink-0 text-sm font-medium text-slate-500 hover:text-brand-700"
                      >
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Profile Information</h2>
              <div className="mt-5 flex items-center gap-4">
                <Avatar user={user} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{getFullName(user)}</p>
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Role</dt>
                  <dd className="font-medium text-slate-900">{capitalize(user.role)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium text-emerald-600">{user.isActive ? "Active" : "Inactive"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Member since</dt>
                  <dd className="font-medium text-slate-900">{formatDate(user.createdAt)}</dd>
                </div>
              </dl>
              <Button href="/dashboard/profile" variant="secondary" className="mt-6 w-full">
                Edit Profile
              </Button>
            </section>
          </div>
        </>
      )}
    </>
  );
}
