"use client";

import { NetworkGraph, type SizeMode } from "@/components/NetworkGraph";
import { OrganizationDetails } from "@/components/OrganizationDetails";
import { OrganizationDirectory } from "@/components/OrganizationDirectory";
import { buildGraph, REGIONS } from "@/lib/data";
import { partnerIds, snapshotLabel, STATUS_OPTIONS } from "@/lib/explorer";
import { colorForCategory } from "@/lib/colors";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

export function NetworkExplorer({ initialRegion }: { initialRegion: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const graph = useMemo(() => buildGraph(initialRegion), [initialRegion]);
  const region = REGIONS.find((r) => r.code === initialRegion)!;
  const query = params.get("q") ?? "";
  const category = params.get("service") ?? "";
  const status = params.get("status") ?? "";
  const view = params.get("view") === "directory" ? "directory" : "network";
  const sizeMode: SizeMode =
    params.get("size") === "connections" ? "connections" : "uniform";
  const selected = graph.nodes.find((n) => n.id === params.get("org")) ?? null;
  const focused = params.get("focus") === "1" && !!selected;
  const comparison = params
    .getAll("compare")
    .filter((id) => graph.nodes.some((n) => n.id === id))
    .slice(0, 3);
  const categories = useMemo(
    () => [...new Set(graph.nodes.map((n) => n.category))].sort(),
    [graph],
  );

  const update = useCallback(
    (changes: Record<string, string | string[] | null>, replace = false) => {
      const url = new URL(window.location.href);
      for (const [key, value] of Object.entries(changes)) {
        url.searchParams.delete(key);
        if (Array.isArray(value))
          value.forEach((item) => url.searchParams.append(key, item));
        else if (value) url.searchParams.set(key, value);
      }
      const next = `${url.pathname}${url.search}`;
      if (next !== `${window.location.pathname}${window.location.search}`) {
        if (replace) window.history.replaceState(null, "", next);
        else window.history.pushState(null, "", next);
      }
    },
    [],
  );

  const selectOrganization = useCallback(
    (id: string | null) => {
      update({ org: id, focus: null });
    },
    [update],
  );
  const neighbors = useMemo(
    () => (selected ? partnerIds(graph, selected.id) : new Set<string>()),
    [graph, selected],
  );
  const filteredGraph = useMemo(() => {
    const nodes = graph.nodes.filter(
      (node) =>
        (!query ||
          node.id
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase())) &&
        (!category || node.category === category) &&
        (!status || node.granteeStatus === status) &&
        (!focused || node.id === selected?.id || neighbors.has(node.id)),
    );
    const ids = new Set(nodes.map((n) => n.id));
    return {
      nodes,
      links: graph.links.filter((l) => ids.has(l.source) && ids.has(l.target)),
    };
  }, [graph, query, category, status, focused, selected, neighbors]);
  const visibleIds = new Set(filteredGraph.nodes.map((n) => n.id));
  const multiRegion = graph.nodes.filter(
    (n) =>
      new Set([...n.primaryRegionCodes, ...n.secondaryRegionCodes]).size > 1,
  ).length;
  const noRecordedPartners = graph.nodes.filter(
    (n) => partnerIds(graph, n.id).size === 0,
  ).length;
  const clearFilters = () =>
    update({ q: null, service: null, status: null, focus: null });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice(
        "Link copied. It includes this region, filters, and selection.",
      );
    } catch {
      setNotice("Copy the address from your browser to share this exact view.");
    }
  }

  return (
    <main className="flex flex-1 flex-col bg-secondary/50 text-foreground font-sans">
      <header className="border-b border-border/50 bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              MHM / Digital equity explorer
            </p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Connections that support communities.
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              Find an organization, understand its partnerships, and explore the
              regional network.
            </p>
          </div>
          <button type="button" className="explorer-button" onClick={copyLink}>
            Share view <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="mt-6 hidden grid-cols-4 gap-4 border-t border-border/40 pt-4 sm:grid">
          {[
            [graph.nodes.length, "Organizations recorded"],
            [categories.length, "Service types represented"],
            [multiRegion, "Multi-region organizations"],
            [noRecordedPartners, "Without recorded partners"],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight">
                {value}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 hidden text-sm text-muted-foreground sm:block">
          Regional totals before filters · Snapshot generated {snapshotLabel} ·
          Working dataset, not independently verified
        </p>
        <details className="mt-4 border-t border-border/40 pt-3 text-sm sm:hidden">
          <summary className="font-semibold">Regional context · {graph.nodes.length} organizations</summary>
          <p className="mt-3 leading-relaxed text-muted-foreground">{categories.length} service types · {multiRegion} multi-region organizations · {noRecordedPartners} without recorded partners. Totals are before filters. Snapshot generated {snapshotLabel}; working dataset, not independently verified.</p>
        </details>
      </header>

      <section
        aria-label="Explore organizations"
        className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-48 flex-1 flex-col gap-2 text-sm font-medium">
            Find an organization
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Search organization names…"
              onChange={(e) => update({ q: e.target.value }, true)}
              className="explorer-input"
            />
          </label>
          <label className="flex w-full flex-col gap-2 text-sm font-medium sm:w-64">
            Region
            <select
              className="explorer-input"
              value={initialRegion}
              onChange={(e) => {
                const next = new URLSearchParams(params.toString());
                ["org", "focus", "compare"].forEach((key) => next.delete(key));
                router.push(`/regions/${e.target.value}?${next.toString()}`);
              }}
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-2 text-sm font-medium">
            Service type
            <select
              className="explorer-input"
              value={category}
              onChange={(e) => update({ service: e.target.value })}
            >
              <option value="">All service types</option>
              {[
                ...new Set([...categories, ...(category ? [category] : [])]),
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-2 text-sm font-medium">
            Grantee status
            <select
              className="explorer-input"
              value={status}
              onChange={(e) => update({ status: e.target.value })}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option value={s.value} key={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(query || category || status || focused) && (
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Active filters"
          >
            {query && (
              <button
                className="filter-chip"
                onClick={() => update({ q: null })}
                aria-label="Remove search filter"
              >
                Search: {query} <span aria-hidden="true">×</span>
              </button>
            )}
            {category && (
              <button
                className="filter-chip"
                onClick={() => update({ service: null })}
                aria-label="Remove service filter"
              >
                {category} <span aria-hidden="true">×</span>
              </button>
            )}
            {status && (
              <button
                className="filter-chip"
                onClick={() => update({ status: null })}
                aria-label="Remove status filter"
              >
                {STATUS_OPTIONS.find((s) => s.value === status)?.label ??
                  status}{" "}
                <span aria-hidden="true">×</span>
              </button>
            )}
            {focused && (
              <button
                className="filter-chip"
                onClick={() => update({ focus: null })}
              >
                Focused network <span aria-hidden="true">×</span>
              </button>
            )}
            <button
              className="text-sm font-semibold text-primary underline underline-offset-4"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        )}
        {focused && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Focused on {selected?.id} and its recorded partners. Your search and
            service/status filters still apply; clear them to reveal any hidden
            partners.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-lg border border-border/50 bg-background p-1"
            role="group"
            aria-label="Explorer view"
          >
            {(["network", "directory"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => update({ view: v })}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {v === "network" ? "Network" : "Directory & compare"}
              </button>
            ))}
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            Showing{" "}
            <strong className="text-foreground">
              {filteredGraph.nodes.length}
            </strong>{" "}
            of {graph.nodes.length} organizations · {region.label}
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm">
            {view === "network" && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold">
                    Regional partnership network
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select a circle to explore its partners. Positions are not
                    geographic.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  Size by{" "}
                  <select
                    className="explorer-input"
                    value={sizeMode}
                    onChange={(e) => update({ size: e.target.value })}
                  >
                    <option value="uniform">Equal size</option>
                    <option value="connections">Regional partners</option>
                  </select>
                </label>
              </div>
            )}
            {filteredGraph.nodes.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center">
                <h2 className="text-xl font-semibold">
                  No organizations match these filters
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Try a broader search or remove a filter. Missing records do
                  not necessarily mean a service gap.
                </p>
                <button className="explorer-button" onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            ) : view === "network" ? (
              <div className="h-[440px] lg:h-[540px]">
                <NetworkGraph
                  graph={filteredGraph}
                  focusNodeId={
                    selected && visibleIds.has(selected.id) ? selected.id : null
                  }
                  onSelectionChange={selectOrganization}
                  sizeMode={sizeMode}
                />
              </div>
            ) : (
              <OrganizationDirectory
                graph={graph}
                nodes={filteredGraph.nodes}
                selectedId={selected?.id ?? null}
                onSelect={selectOrganization}
                comparison={comparison}
                onCompare={(id) =>
                  update({
                    compare: comparison.includes(id)
                      ? comparison.filter((c) => c !== id)
                      : [...comparison, id].slice(0, 3),
                  })
                }
                onClearComparison={() => update({ compare: null })}
                regionLabel={region.label}
              />
            )}
            {view === "network" && (
              <details className="border-t border-border/40 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  How to read this network
                </summary>
                <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                  <div className="flex flex-wrap gap-3">
                    {categories.map((c) => (
                      <span key={c} className="flex items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: colorForCategory(c) }}
                        />
                        {c}
                      </span>
                    ))}
                  </div>
                  <p>
                    Solid lines: collaboration. Dashed lines: funding. Darker
                    lines: recorded strong/active relationships. Heavier lines
                    originate from current grantees. A thicker circle border
                    marks an MHM grantee.
                  </p>
                  <p>
                    {sizeMode === "uniform"
                      ? "All organizations have equal-sized circles; size does not indicate funding or impact."
                      : "Circle area reflects distinct recorded partners across the full region, not just visible partners. A minimum circle size keeps organizations with no recorded partners visible."}{" "}
                    Funding and people served are available in organization
                    details, with source periods, rather than as potentially
                    misleading circle sizes.
                  </p>
                </div>
              </details>
            )}
          </div>
          {selected && (
            <OrganizationDetails
              key={selected.id}
              node={selected}
              graph={graph}
              visibleIds={visibleIds}
              onSelect={selectOrganization}
              onClose={() => {
                selectOrganization(null);
                searchRef.current?.focus();
              }}
              onFocus={() => update({ view: "network", focus: "1" })}
              onShare={copyLink}
            />
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3 text-sm leading-relaxed text-muted-foreground">
          <p className="max-w-3xl">
            A missing connection means no partnership was recorded—not that one
            does not exist. Regional membership is based on tracker records, not
            verified service coverage.
          </p>
          <Link
            className="shrink-0 font-semibold text-primary underline underline-offset-4"
            href="/methodology"
          >
            Data & methodology →
          </Link>
        </div>
        <p aria-live="polite" className="text-sm text-primary">
          {notice}
        </p>
      </section>
    </main>
  );
}
