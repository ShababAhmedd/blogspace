"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";
import Loader from "./Loader";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) return <Loader fullPage text="Checking your session..." />;
  if (!isAuthenticated) return <Loader fullPage text="Redirecting to login..." />;
  return children;
}

export function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <AccessDenied />;
  return children;
}

// login/register pages send signed-in users on to the dashboard (or the page they came for)
export function GuestOnly({ children, redirectTo = "/dashboard" }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace(redirectTo);
  }, [loading, isAuthenticated, router, redirectTo]);

  if (loading || isAuthenticated) return <Loader />;
  return children;
}

export function AccessDenied({ message = "You don't have permission to view this page. It is only available to administrators." }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Access Denied</h1>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <Button href="/dashboard" className="mt-6">
        Back to Dashboard
      </Button>
    </div>
  );
}
