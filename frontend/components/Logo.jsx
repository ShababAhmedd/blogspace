import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
        </svg>
      </span>
      <span>
        Blog<span className="text-brand-600">Space</span>
      </span>
    </Link>
  );
}
