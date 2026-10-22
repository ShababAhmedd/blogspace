"use client";

import { useEffect, useId, useRef, useState } from "react";

// keeps its own text while typing and reports it after a short pause (or on Enter)
export default function SearchBar({
  value = "",
  onSearch,
  placeholder = "Search blogs...",
  autoSearch = true,
  size = "md",
  className = "",
  name = "search",
}) {
  const id = `${name}-${useId()}`;
  const [text, setText] = useState(value);
  const lastSent = useRef(value);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // follow external changes, e.g. the other search box or browser back/forward
  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (!autoSearch || text === lastSent.current) return;
    const timer = setTimeout(() => {
      lastSent.current = text;
      onSearchRef.current(text);
    }, 400);
    return () => clearTimeout(timer);
  }, [text, autoSearch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    lastSent.current = text;
    onSearchRef.current(text);
  };

  const clear = () => {
    setText("");
    lastSent.current = "";
    onSearchRef.current("");
  };

  const height = size === "lg" ? "h-12 text-base pl-11" : "h-10 text-sm pl-10";

  return (
    <form role="search" onSubmit={handleSubmit} className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search blogs by title
      </label>
      <svg
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${size === "lg" ? "left-4 h-5 w-5" : "left-3 h-4 w-4"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        id={id}
        name={name}
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-lg border border-slate-300 bg-white pr-9 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 [&::-webkit-search-cancel-button]:hidden ${height}`}
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ×
        </button>
      )}
    </form>
  );
}
