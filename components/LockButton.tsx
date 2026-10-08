"use client";

import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { lock } from "@/app/unlock/actions";
import { isLockedPath } from "@/lib/access";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-full bg-[var(--cobalt)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#2E3DB8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] disabled:opacity-70"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      {pending ? "Locking..." : "Lock"}
    </button>
  );
}

export function LockButton() {
  const pathname = usePathname();
  if (!isLockedPath(pathname)) return null;

  return (
    <form action={lock} className="fixed bottom-6 right-6 z-50">
      <input type="hidden" name="next" value={pathname} />
      <SubmitButton />
    </form>
  );
}
