"use client";

import { useRouter } from "next/navigation";
import BlogForm from "@/components/BlogForm";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import blogService from "@/services/blog.service";

export default function CreateBlogView() {
  usePageTitle("Create Blog");
  const router = useRouter();
  const toast = useToast();

  // no userId is sent: the backend takes the author from the auth token
  const handleSubmit = async (values) => {
    await blogService.createBlog(values);
    toast.success("Blog published successfully.");
    router.push("/dashboard/blogs");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Create Blog" description="Write something worth reading. You can edit it any time." />
      <BlogForm onSubmit={handleSubmit} submitText="Publish Blog" loadingText="Publishing..." />
    </div>
  );
}
