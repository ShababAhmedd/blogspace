import Link from "next/link";
import Avatar from "./Avatar";
import CategoryBadge from "./CategoryBadge";
import { formatDate, getFullName, getPreview } from "@/utils/format";

export default function BlogCard({ blog }) {
  return (
    <article className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <CategoryBadge category={blog.category} />
        <time dateTime={blog.createdAt} className="text-xs text-slate-500">
          {formatDate(blog.createdAt)}
        </time>
      </div>
      <h2 className="mt-4 text-lg font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
        <Link href={`/blogs/${blog.id}`} className="break-words">
          {blog.blogTitle}
        </Link>
      </h2>
      <p className="mt-2 flex-1 break-words text-sm leading-relaxed text-slate-600">{getPreview(blog.blog)}</p>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar user={blog.author} size="sm" />
          <span className="truncate text-sm font-medium text-slate-700">{getFullName(blog.author)}</span>
        </div>
        <Link
          href={`/blogs/${blog.id}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          aria-label={`Read more: ${blog.blogTitle}`}
        >
          Read More <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
