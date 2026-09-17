"use client";

import { getOrganizationIndex, type OrgIndexEntry } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_RESULTS = 50;

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="6" />
      <path d="m18 18-4.35-4.35" />
    </svg>
  );
}

export function OrgSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const orgs = useMemo(() => getOrganizationIndex(), []);

  // "@" means "browse everything"; text after it still narrows the list, so
  // "@lar" browses all orgs matching "lar" without needing the exact name.
  const isBrowseAll = query.trimStart().startsWith("@");
  const term = (isBrowseAll ? query.trimStart().slice(1) : query).trim().toLowerCase();

  const results = useMemo<OrgIndexEntry[]>(() => {
    if (!isBrowseAll && term === "") return [];
    const matched = term === "" ? orgs : orgs.filter((o) => o.name.toLowerCase().includes(term));
    return matched.slice(0, MAX_RESULTS);
  }, [orgs, term, isBrowseAll]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const select = useCallback(
    (entry: OrgIndexEntry) => {
      router.push(`/regions/${entry.regionCode}?org=${encodeURIComponent(entry.name)}`);
      close();
    },
    [router, close],
  );

  // Global ⌘K / Ctrl+K to open from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the active row from drifting past the (possibly shorter) result set.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = results[activeIndex];
      if (entry) select(entry);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground sm:px-3 sm:text-sm"
        aria-label="Search organizations"
      >
        <SearchIcon className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">Search organizations</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 px-4 pt-[12vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Search organizations"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder='Search organizations, or type "@" to browse all…'
                className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search organizations"
                aria-autocomplete="list"
                aria-controls="org-search-results"
                aria-activedescendant={results[activeIndex] ? `org-opt-${activeIndex}` : undefined}
              />
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close search"
              >
                Esc
              </button>
            </div>

            {results.length > 0 ? (
              <ul id="org-search-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
                {results.map((entry, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={`${entry.name}-${entry.regionCode}`} role="option" aria-selected={active} id={`org-opt-${index}`} data-index={index}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => select(entry)}
                        className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors ${active ? "bg-accent" : ""}`}
                      >
                        <span className="text-sm font-medium text-foreground">{entry.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.regionLabel} &middot; {entry.category}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                {term === "" && !isBrowseAll ? (
                  <>
                    Start typing an organization name, or type{" "}
                    <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-xs text-foreground">@</kbd>{" "}
                    to browse every organization.
                  </>
                ) : (
                  <>No organizations match &ldquo;{term}&rdquo;.</>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-2 text-[11px] text-muted-foreground">
              <span>
                {results.length > 0
                  ? `${results.length}${results.length === MAX_RESULTS ? "+" : ""} organization${results.length === 1 ? "" : "s"}`
                  : `${orgs.length} organizations total`}
              </span>
              <span className="hidden items-center gap-3 sm:flex">
                <span>↑↓ to navigate</span>
                <span>↵ to open</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
