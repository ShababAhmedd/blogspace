"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import CategoryBadge from "@/components/CategoryBadge";
import CategoryFilter from "@/components/CategoryFilter";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import blogService from "@/services/blog.service";
import { getErrorMessage } from "@/utils/api";
import { formatDate, getFullName } from "@/utils/format";

export default function ManageBlogsView() {
  const { user, isAdmin } = useAuth();
  usePageTitle(isAdmin ? "All Blogs" : "My Blogs");
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const latestRequest = useRef(0);

  const loadBlogs = useCallback(async () => {
    // only the newest request may update the list, so a slow earlier search can't overwrite it
    const request = ++latestRequest.current;
    setError("");
    try {
      const data = await blogService.getBlogs({ title, category });
      if (request !== latestRequest.current) return;
      // the API returns every blog; normal users manage only their own
      setBlogs(isAdmin ? data : data.filter((blog) => blog.author?.id === user.id));
    } catch (err) {
      if (request === latestRequest.current) setError(getErrorMessage(err, "Could not load blogs."));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [title, category, isAdmin, user.id]);

  useEffect(() => {
    setLoading(true);
    loadBlogs();
  }, [loadBlogs]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await blogService.deleteBlog(toDelete.id);
      toast.success("Blog deleted successfully.");
      setToDelete(null);
      await loadBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the blog."));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = Boolean(title || category);

  const actions = (blog) => (
    <div className="flex items-center justify-end gap-1">
      <Button href={`/blogs/${blog.id}`} variant="ghost" size="sm">
        View
      </Button>
      <Button href={`/dashboard/blogs/${blog.id}/edit`} variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700">
        Edit
      </Button>
      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setToDelete(blog)}>
        Delete
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        title={isAdmin ? "All Blogs" : "My Blogs"}
        description={isAdmin ? "Manage every blog published on BlogSpace." : "Create, edit and delete the blogs you've written."}
        actions={<Button href="/dashboard/blogs/create">+ Create Blog</Button>}
      />

      <div className="mb-6 space-y-4">
        <SearchBar name="manage-search" value={title} onSearch={setTitle} className="max-w-md" placeholder="Search by title..." />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <Alert className="mb-6">{error}</Alert>

      {loading ? (
        <TableSkeleton />
      ) : error ? null : blogs.length === 0 ? (
        <EmptyState
          icon={filtered ? "search" : "document"}
          title={filtered ? "No blogs found." : isAdmin ? "No blogs found." : "You haven't created any blogs yet."}
          description={filtered ? "Try a different search or category." : "Your published blogs will appear here."}
          action={!filtered && <Button href="/dashboard/blogs/create">Create Blog</Button>}
        />
      ) : (
        <>
          {/* table on wide screens */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Author</th>
                  <th scope="col" className="px-6 py-3">Created</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/60">
                    <td className="max-w-xs px-6 py-4">
                      <Link href={`/blogs/${blog.id}`} className="line-clamp-2 font-medium text-slate-900 hover:text-brand-700">
                        {blog.blogTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={blog.category} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar user={blog.author} size="xs" />
                        <span className="whitespace-nowrap text-slate-700">
                          {blog.author?.id === user.id ? "You" : getFullName(blog.author)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">{formatDate(blog.createdAt)}</td>
                    <td className="px-6 py-4">{actions(blog)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* cards on smaller screens */}
          <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
            {blogs.map((blog) => (
              <li key={blog.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={blog.category} />
                  <span className="text-xs text-slate-500">{formatDate(blog.createdAt)}</span>
                </div>
                <Link href={`/blogs/${blog.id}`} className="mt-3 block break-words font-semibold text-slate-900">
                  {blog.blogTitle}
                </Link>
                <p className="mt-1 text-sm text-slate-500">by {blog.author?.id === user.id ? "You" : getFullName(blog.author)}</p>
                <div className="mt-3 border-t border-slate-100 pt-2">{actions(blog)}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete blog"
        message={
          <>
            Are you sure you want to delete this blog? <strong>&ldquo;{toDelete?.blogTitle}&rdquo;</strong> will be permanently
            removed.
          </>
        }
        confirmText="Delete"
        loadingText="Deleting..."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
