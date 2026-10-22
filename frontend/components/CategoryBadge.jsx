const colors = {
  Testing: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Automation: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Programming: "bg-violet-50 text-violet-700 ring-violet-600/20",
  DevOps: "bg-amber-50 text-amber-700 ring-amber-600/20",
  AI: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[category] || "bg-slate-50 text-slate-700 ring-slate-600/20"}`}
    >
      {category}
    </span>
  );
}
