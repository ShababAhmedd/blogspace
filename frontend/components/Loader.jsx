export function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function Loader({ text = "Loading...", fullPage = false }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${fullPage ? "min-h-screen" : "py-16"}`}
    >
      <Spinner className="h-8 w-8 text-brand-600" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
      <div className="h-5 w-20 rounded-full bg-slate-200" />
      <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 rounded bg-slate-200" />
        <div className="h-3 rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-200" />
        <div className="h-3 w-32 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white" aria-hidden="true">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-6 px-6 py-4">
          {Array.from({ length: cols }, (_, col) => (
            <div key={col} className="h-4 flex-1 rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  );
}
