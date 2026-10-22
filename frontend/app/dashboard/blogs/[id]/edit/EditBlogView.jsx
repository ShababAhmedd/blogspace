"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import BlogForm from "@/components/BlogForm";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import { AccessDenied } from "@/components/RouteGuards";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import blogService from "@/services/blog.service";
import { getErrorMessage } from "@/utils/api";
import { getFullName } from "@/utils/format";

export default function EditBlogView() {
  usePageTitle("Edit Blog");
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { user, isAdmin } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    // the page refetches each time it is shown again; errors from an earlier visit are cleared on success
    blogService
      .getBlogById(id)
      .then((data) => {
        if (ignore) return;
        setBlog(data);
        setNotFound(false);
        setError("");
      })
      .catch((err) => {
        if (ignore) return;
        const missing = [400, 404].includes(err.response?.status);
        setNotFound(missing);
        setError(missing ? "" : getErrorMessage(err, "Could not load this blog."));
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleSubmit = async (values) => {
    await blogService.updateBlog(id, values);
    toast.success("Blog updated successfully.");
    router.push("/dashboard/blogs");
  };

  if (loading) return <Loader text="Loading blog..." />;

  if (notFound) {
    return (
      <EmptyState
        title="Blog not found."
        description="This blog doesn't exist or has already been deleted."
        action={<Button href="/dashboard/blogs">Back to blogs</Button>}
      />
    );
  }

  if (error) return <Alert>{error}</Alert>;

  // the backend also rejects this with 403; this just avoids showing a form that can't be saved
  if (!isAdmin && blog.author?.id !== user.id) {
    return <AccessDenied message="You are not authorized to update this blog. Only its author or an admin can edit it." />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Edit Blog"
        description={
          blog.author?.id === user.id ? "Update your blog and save the changes." : `Editing a blog by ${getFullName(blog.author)} as admin.`
        }
      />
      <BlogForm
        key={blog.updatedAt}
        initialValues={blog}
        onSubmit={handleSubmit}
        submitText="Save Changes"
        loadingText="Saving..."
      />
    </div>
  );
}
