"use client";

import { useEffect, useId, useRef } from "react";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  loadingText = "Please wait...",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => !loading && onCancel()} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variant === "danger" ? "bg-red-100 text-red-600" : "bg-brand-100 text-brand-600"}`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h2 id={titleId} className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p id={messageId} className="mt-1 text-sm text-slate-600">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} loadingText={loadingText}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
