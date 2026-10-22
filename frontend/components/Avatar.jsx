"use client";

import { useState } from "react";
import { getImageUrl } from "@/utils/format";

const sizes = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-3xl",
};

// shows the uploaded image, falling back to a default avatar
export default function Avatar({ user, src, size = "sm", className = "" }) {
  const imageUrl = src || getImageUrl(user?.profileImage);
  const [failedUrl, setFailedUrl] = useState(null);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";

  if (imageUrl && failedUrl !== imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        onError={() => setFailedUrl(imageUrl)}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-400 ring-2 ring-white ${sizes[size]} ${className}`}
    >
      <svg className="h-[70%] w-[70%] translate-y-[12%]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-10 2.67-10 6v2h20v-2c0-3.33-4.67-6-10-6z" />
      </svg>
    </span>
  );
}
