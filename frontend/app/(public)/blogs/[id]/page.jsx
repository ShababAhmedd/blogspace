"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import CategoryBadge from "@/components/CategoryBadge";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import blogService from "@/services/blog.service";
import { getErrorMessage } from "@/utils/api";
import { formatDate, getFullName } from "@/utils/format";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  usePageTitle(blog?.blogTitle || (notFound ? "Blog Not Found" : "Blog"));

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    blogService
      .getBlogById(id)
      .then((data) => !ignore && setBlog(data))
      .catch((err) => {
        if (ignore) return;
        // the API answers 400 for a malformed id and 404 for a missing blog
        if ([400, 404].includes(err.response?.status)) setNotFound(true);
        else setError(getErrorMessage(err, "Could not load this blog."));
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loader text="Loading blog..." />;

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Blog Not Found</h1>
        <p className="mt-2 text-slate-600">The blog you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button href="/" className="mt-6">
          Browse blogs
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <Alert>{error}</Alert>
      </div>
    );
  }

  const canEdit = user && (isAdmin || user.id === blog.author?.id);
  const edited = blog.updatedAt && new Date(blog.updatedAt) - new Date(blog.createdAt) > 60000;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
        <span aria-hidden="true">←</span> All blogs
      </Link>

      <header className="mt-6">
        <CategoryBadge category={blog.category} />
        <h1 className="mt-4 break-words text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {blog.blogTitle}
        </h1>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4">
          <div className="flex items-center gap-3">
            <Avatar user={blog.author} size="md" />
            <div>
              <p className="font-semibold text-slate-900">{getFullName(blog.author)}</p>
              <p className="text-sm text-slate-500">
                <time dateTime={blog.createdAt}>{formatDate(blog.createdAt, { month: "long", day: "numeric", year: "numeric" })}</time>
                {edited && <span> · Updated {formatDate(blog.updatedAt)}</span>}
              </p>
            </div>
          </div>
          {canEdit && (
            <Button href={`/dashboard/blogs/${blog.id}/edit`} variant="secondary" size="sm">
              Edit blog
            </Button>
          )}
        </div>
      </header>

      <div className="mt-8 space-y-6 break-words text-[17px] leading-8 text-slate-700">
        {blog.blog
          .split(/\n\s*\n/)
          .filter((paragraph) => paragraph.trim())
          .map((paragraph, index) =>
            // a paragraph that is entirely a quotation is shown as a pull quote
            /^\s*[“"].*[”"]\s*$/s.test(paragraph) ? (
              <blockquote key={index} className="border-l-4 border-brand-500 bg-brand-50/60 py-3 pl-5 pr-4 text-lg font-medium italic text-slate-800">
                {paragraph.trim()}
              </blockquote>
            ) : (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ),
          )}
      </div>
    </article>
  );
}
