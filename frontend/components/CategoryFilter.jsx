"use client";

import { CATEGORIES } from "@/utils/constants";

export default function CategoryFilter({ value = "", onChange, className = "" }) {
  const options = [{ label: "All", value: "" }, ...CATEGORIES.map((category) => ({ label: category, value: category }))];

  return (
    <div role="group" aria-label="Filter by category" className={`-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
