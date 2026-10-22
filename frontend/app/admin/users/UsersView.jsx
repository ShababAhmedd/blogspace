"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import useUserStatus from "@/hooks/useUserStatus";
import userService from "@/services/user.service";
import { getErrorMessage } from "@/utils/api";
import { capitalize, formatDate, getFullName } from "@/utils/format";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function UsersView() {
  usePageTitle("Users");
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const status = useUserStatus((updated) =>
    setUsers((current) => current.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))),
  );

  useEffect(() => {
    let ignore = false;
    userService
      .getUsers()
      .then((data) => !ignore && setUsers(data))
      .catch((err) => !ignore && setError(getErrorMessage(err, "Could not load users.")))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "inactive" && u.isActive) return false;
      return !term || `${getFullName(u)} ${u.email}`.toLowerCase().includes(term);
    });
  }, [users, query, statusFilter]);

  const statusButton = (u) =>
    u.id === currentUser.id ? (
      <span className="text-xs text-slate-400">You</span>
    ) : (
      <Button
        size="sm"
        variant={u.isActive ? "secondary" : "primary"}
        className={u.isActive ? "text-red-600 hover:text-red-700" : ""}
        loading={status.pendingId === u.id}
        loadingText={u.isActive ? "Deactivating..." : "Activating..."}
        onClick={() => status.toggle(u)}
      >
        {u.isActive ? "Deactivate" : "Activate"}
      </Button>
    );

  return (
    <>
      <PageHeader title="Users" description="View accounts and control who can sign in." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search users"
          className="h-10 w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex gap-2" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                statusFilter === f.value ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Alert className="mb-6">{error}</Alert>

      {loading ? (
        <TableSkeleton />
      ) : error ? null : visible.length === 0 ? (
        <EmptyState icon="users" title="No users found." description={users.length ? "Try a different search or filter." : undefined} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="hidden px-4 py-3 2xl:table-cell">Joined</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4">
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 font-medium text-slate-900 hover:text-brand-700">
                        <Avatar user={u} size="sm" />
                        <span className="whitespace-nowrap">{getFullName(u)}</span>
                      </Link>
                    </td>
                    <td className="max-w-[16rem] truncate px-4 py-4 text-slate-600" title={u.email}>{u.email}</td>
                    <td className="px-4 py-4 text-slate-600">{capitalize(u.role)}</td>
                    <td className="px-4 py-4">
                      <StatusBadge active={u.isActive} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-slate-500 2xl:table-cell">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button href={`/admin/users/${u.id}`} variant="ghost" size="sm">
                          View
                        </Button>
                        {statusButton(u)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {visible.map((u) => (
              <li key={u.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                  <Avatar user={u} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{getFullName(u)}</p>
                    <p className="truncate text-sm text-slate-500">{u.email}</p>
                  </div>
                  <StatusBadge active={u.isActive} />
                </Link>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">{capitalize(u.role)} · joined {formatDate(u.createdAt)}</span>
                  {statusButton(u)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(status.confirmUser)}
        title="Deactivate user"
        message={`Are you sure you want to deactivate ${getFullName(status.confirmUser)}? They will not be able to log in until reactivated.`}
        confirmText="Deactivate"
        loadingText="Deactivating..."
        loading={Boolean(status.pendingId)}
        onConfirm={status.confirmDeactivate}
        onCancel={status.cancel}
      />
    </>
  );
}
