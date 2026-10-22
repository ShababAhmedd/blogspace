"use client";

import { useId } from "react";

const fieldClasses = (error) =>
  `block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-300 focus:border-brand-500 focus:ring-brand-100"
  }`;

// `id` is the field name; the DOM id is made unique because Next.js keeps
// previously visited pages mounted (hidden), which would otherwise duplicate ids
export default function FormField({ label, id, error, hint, as = "input", children, className = "", ...props }) {
  const fieldId = `${id}-${useId()}`;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  const shared = {
    id: fieldId,
    name: id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    className: fieldClasses(error),
    ...props,
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {as === "textarea" && <textarea {...shared} />}
      {as === "select" && <select {...shared}>{children}</select>}
      {as === "input" && <input {...shared} />}
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
