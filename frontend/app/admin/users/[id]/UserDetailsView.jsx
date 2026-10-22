"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import CategoryBadge from "@/components/CategoryBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import useUserStatus from "@/hooks/useUserStatus";
import blogService from "@/services/blog.service";
import userService from "@/services/user.service";
import { getErrorMessage } from "@/utils/api";
import { capitalize, formatDate, getFullName } from "@/utils/format";

export default function UserDetailsView() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  usePageTitle(user ? getFullName(user) : "User");

  const status = useUserStatus((updated) => setUser((current) => ({ ...current, ...updated })));

  useEffect(() => {
    let ignore = false;
    Promise.all([userService.getUserById(id), blogService.getBlogs()])
      .then(([userData, blogData]) => {
        if (ignore) return;
        setUser(userData);
        setBlogs(blogData.filter((blog) => blog.author?.id === userData.id));
      })
      .catch((err) => {
        if (ignore) return;
        if ([400, 404].includes(err.response?.status)) setNotFound(true);
        else setError(getErrorMessage(err, "Could not load this user."));
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loader text="Loading user..." />;
  if (notFound) {
    return (
      <EmptyState icon="users" title="User not found." description="This account doesn't exist." action={<Button href="/admin/users">Back to users</Button>} />
    );
  }
  if (error) return <Alert>{error}</Alert>;

  const isSelf = user.id === currentUser.id;
  const details = [
    ["Name", getFullName(user)],
    ["Email", user.email],
    ["Role", capitalize(user.role)],
    ["Status", <StatusBadge key="status" active={user.isActive} />],
    ["Created", formatDate(user.createdAt, { month: "long", day: "numeric", year: "numeric" })],
    ["Last updated", formatDate(user.updatedAt, { month: "long", day: "numeric", year: "numeric" })],
  ];

  return (
    <>
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
        <span aria-hidden="true">←</span> All users
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Avatar user={user} size="xl" className="mx-auto ring-4 ring-brand-50" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">{getFullName(user)}</h1>
          <p className="break-all text-sm text-slate-500">{user.email}</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{capitalize(user.role)}</span>
            <StatusBadge active={user.isActive} />
          </div>
          {isSelf ? (
            <p className="mt-6 text-xs text-slate-500">This is your account. You can&apos;t change your own status.</p>
          ) : (
            <Button
              className="mt-6 w-full"
              variant={user.isActive ? "danger" : "primary"}
              loading={status.pendingId === user.id}
              loadingText={user.isActive ? "Deactivating..." : "Activating..."}
              onClick={() => status.toggle(user)}
            >
              {user.isActive ? "Deactivate User" : "Activate User"}
            </Button>
          )}
        </section>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 px-6 py-4 font-semibold text-slate-900">User Information</h2>
            <dl className="divide-y divide-slate-100">
              {details.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 px-6 py-3.5 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="col-span-2 break-words font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 px-6 py-4 font-semibold text-slate-900">Blogs ({blogs.length})</h2>
            {blogs.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-500">This user hasn&apos;t published any blogs yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {blogs.map((blog) => (
                  <li key={blog.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link href={`/blogs/${blog.id}`} className="block truncate font-medium text-slate-900 hover:text-brand-700">
                        {blog.blogTitle}
                      </Link>
                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <CategoryBadge category={blog.category} /> {formatDate(blog.createdAt)}
                      </p>
                    </div>
                    <Link href={`/dashboard/blogs/${blog.id}/edit`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(status.confirmUser)}
        title="Deactivate user"
        message={`Are you sure you want to deactivate ${getFullName(user)}? They will not be able to log in until reactivated.`}
        confirmText="Deactivate"
        loadingText="Deactivating..."
        loading={Boolean(status.pendingId)}
        onConfirm={status.confirmDeactivate}
        onCancel={status.cancel}
      />
    </>
  );
}
