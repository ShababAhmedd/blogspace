"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Alert from "./Alert";
import Button from "./Button";
import FormField from "./FormField";
import { getErrorMessage } from "@/utils/api";
import { CATEGORIES } from "@/utils/constants";
import { hasErrors, validateBlog } from "@/utils/validation";

const emptyBlog = { blogTitle: "", category: "", blog: "" };

const pickFields = (source) => ({
  blogTitle: source.blogTitle || "",
  category: source.category || "",
  blog: source.blog || "",
});

export default function BlogForm({
  initialValues = emptyBlog,
  onSubmit,
  submitText = "Publish Blog",
  loadingText = "Publishing...",
  cancelHref = "/dashboard/blogs",
}) {
  const [values, setValues] = useState(() => pickFields(initialValues));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  // Next.js keeps this page mounted but hidden after navigating away; after a
  // successful submit, start fresh next time instead of showing a stuck form
  useLayoutEffect(
    () => () => {
      if (submitted.current) {
        submitted.current = false;
        setValues(pickFields(initialValues));
        setErrors({});
        setTouched({});
        setSubmitting(false);
      }
    },
    [initialValues],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateBlog(next));
  };

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
    setErrors(validateBlog(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validateBlog(values);
    setErrors(validation);
    setTouched({ blogTitle: true, category: true, blog: true });
    if (hasErrors(validation)) return;

    setServerError("");
    setSubmitting(true);
    try {
      await onSubmit({
        blogTitle: values.blogTitle.trim(),
        category: values.category,
        blog: values.blog.trim(),
      });
      submitted.current = true;
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  const show = (field) => (touched[field] ? errors[field] : "");

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <Alert>{serverError}</Alert>

      <FormField
        id="blogTitle"
        label="Blog Title"
        placeholder="e.g. Introduction to Playwright"
        value={values.blogTitle}
        onChange={handleChange}
        onBlur={handleBlur}
        error={show("blogTitle")}
        maxLength={150}
        disabled={submitting}
      />

      <FormField
        id="category"
        as="select"
        label="Category"
        value={values.category}
        onChange={handleChange}
        onBlur={handleBlur}
        error={show("category")}
        disabled={submitting}
      >
        <option value="">Select a category</option>
        {/* keep a category that isn't in the standard list so editing doesn't lose it */}
        {values.category && !CATEGORIES.includes(values.category) && <option value={values.category}>{values.category}</option>}
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FormField>

      <FormField
        id="blog"
        as="textarea"
        label="Blog Content"
        placeholder="Write your blog here..."
        rows={12}
        value={values.blog}
        onChange={handleChange}
        onBlur={handleBlur}
        error={show("blog")}
        hint={`${values.blog.trim().length} characters`}
        disabled={submitting}
      />

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <Button href={cancelHref} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" loading={submitting} loadingText={loadingText}>
          {submitText}
        </Button>
      </div>
    </form>
  );
}
