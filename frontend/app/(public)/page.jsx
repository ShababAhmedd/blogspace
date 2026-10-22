"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";
import BlogCard from "@/components/BlogCard";
import Button from "@/components/Button";
import CategoryFilter from "@/components/CategoryFilter";
import EmptyState from "@/components/EmptyState";
import { BlogCardSkeleton } from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import blogService from "@/services/blog.service";
import { getErrorMessage } from "@/utils/api";

export default function HomePage() {
  usePageTitle("Discover blogs");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const title = searchParams.get("title") || "";
  const category = searchParams.get("category") || "";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    blogService
      .getBlogs({ title, category })
      .then((data) => !ignore && setBlogs(data))
      .catch((err) => !ignore && setError(getErrorMessage(err, "Could not load blogs.")))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [title, category, reloadKey]);

  // search and category live in the URL so results can be shared and survive refresh
  const updateQuery = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  };

  const filtered = Boolean(title || category);

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Ideas worth <span className="text-brand-600">sharing</span>.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Read practical articles on testing, automation, programming, DevOps and AI — written by the community.
            </p>
          </div>
          <div className="mt-8 max-w-2xl">
            <SearchBar
              name="home-search"
              size="lg"
              value={title}
              onSearch={(value) => updateQuery("title", value.trim())}
              placeholder="Search blogs by title..."
            />
          </div>
          {!isAuthenticated && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/register">Start writing</Button>
              <Button href="/login" variant="secondary">
                Login
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter value={category} onChange={(value) => updateQuery("category", value)} />
          {!loading && !error && (
            <p className="shrink-0 text-sm text-slate-500" aria-live="polite">
              {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
              {filtered && " found"}
            </p>
          )}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading blogs...">
              {Array.from({ length: 6 }, (_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Alert>
              {error}{" "}
              <button type="button" className="font-semibold underline" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            </Alert>
          ) : blogs.length === 0 ? (
            <EmptyState
              icon={filtered ? "search" : "document"}
              title="No blogs found."
              description={
                filtered ? "Try a different search term or category." : "Nobody has published a blog yet. Be the first!"
              }
              action={
                filtered ? (
                  <Button variant="secondary" onClick={() => router.replace("/", { scroll: false })}>
                    Clear filters
                  </Button>
                ) : (
                  <Button href={isAuthenticated ? "/dashboard/blogs/create" : "/register"}>Write a blog</Button>
                )
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
