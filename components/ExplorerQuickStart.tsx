"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildGraph, REGIONS } from "@/lib/data";

export function ExplorerQuickStart() {
  const [query, setQuery] = useState("");
  const [regionCode, setRegionCode] = useState(REGIONS[0].code);
  const organizations = useMemo(() => {
    const byName = new Map<string, string[]>();
    for (const region of REGIONS) {
      for (const node of buildGraph(region.code).nodes) {
        byName.set(node.id, [...(byName.get(node.id) ?? []), region.code]);
      }
    }
    return [...byName].sort(([a], [b]) => a.localeCompare(b));
  }, []);
  const matches = query.trim()
    ? organizations.filter(([name]) =>
        name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-5 text-card-foreground shadow-sm">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Find an organization across all regions
        <input
          type="search"
          className="explorer-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by organization name…"
        />
      </label>
      {query.trim() && (
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
          <p role="status" className="text-sm text-muted-foreground">
            {matches.length
              ? `${matches.length} matches${matches.length > 8 ? "; showing the first 8. Refine your search for more." : ""}`
              : "No matching organizations. Try a shorter name."}
          </p>
          {matches.slice(0, 8).map(([name, regions]) => (
            <Link
              key={name}
              className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-accent"
              href={`/regions/${regions[0]}?org=${encodeURIComponent(name)}`}
            >
              <span className="block font-semibold text-primary">{name} →</span>
              <span className="text-muted-foreground">
                Recorded in {regions.length}{" "}
                {regions.length === 1 ? "region" : "regions"} · Opens{" "}
                {regions[0]}
              </span>
            </Link>
          ))}
        </div>
      )}
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Or start with a region
        <select
          className="explorer-input"
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/regions/${regionCode}`}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Explore the network →
        </Link>
        <Link
          href={`/regions/${regionCode}?view=directory`}
          className="explorer-button"
        >
          Browse & compare organizations
        </Link>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Explore recorded partnerships—not a ranking of organizational impact.
      </p>
    </div>
  );
}
