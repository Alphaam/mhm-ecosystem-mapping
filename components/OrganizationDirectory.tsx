"use client";

import { useState } from "react";
import { partnerIds, snapshotLabel, statusLabel } from "@/lib/explorer";
import type { Graph, GraphNode } from "@/lib/types";

export function OrganizationDirectory({
  graph,
  nodes,
  selectedId,
  onSelect,
  comparison,
  onCompare,
  onClearComparison,
  regionLabel,
}: {
  graph: Graph;
  nodes: GraphNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  comparison: string[];
  onCompare: (id: string) => void;
  onClearComparison: () => void;
  regionLabel: string;
}) {
  const [sort, setSort] = useState("name");
  const counts = new Map(
    graph.nodes.map((n) => [n.id, partnerIds(graph, n.id).size]),
  );
  const sorted = [...nodes].sort((a, b) =>
    sort === "partners"
      ? counts.get(b.id)! - counts.get(a.id)! || a.id.localeCompare(b.id)
      : a.id.localeCompare(b.id),
  );
  const compared = comparison.flatMap(
    (id) => graph.nodes.find((n) => n.id === id) ?? [],
  );

  function exportCsv() {
    const rows = [
      [
        "Organization",
        "Region",
        "Service type",
        "Classification basis",
        "Grantee status",
        "Recorded regional partners",
        "Funding",
        "Funding period",
        "Funding scope",
        "People served",
        "People-served period",
        "Snapshot generated",
        "Caveat",
      ],
      ...sorted.map((n) => [
        n.id,
        regionLabel,
        n.category,
        n.categoryInferred ? "Inferred default" : "Recorded",
        statusLabel(n),
        counts.get(n.id),
        n.fundingAmount ?? "Not reported",
        n.fundingYear ?? "Not reported",
        n.fundingSourceLabel ?? "Not reported",
        n.kpi?.latestIndividualsServed ?? "Not reported",
        n.kpi?.latestPeriod ?? "Not reported",
        snapshotLabel,
        "Working dataset; not independently verified. Missing relationships are not evidence of no partnership. Metrics vary by period and scope.",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value ?? "");
            if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
            return `"${text.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mhm-filtered-organizations.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-4 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Organization directory</h2>
          <p className="text-sm text-muted-foreground">
            Select up to 3 organizations to compare.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            Sort{" "}
            <select
              className="explorer-input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Name A–Z</option>
              <option value="partners">Most recorded partners</option>
            </select>
          </label>
          <button className="explorer-button" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>
      {compared.length > 0 && (
        <section
          aria-label="Organization comparison"
          className="flex flex-col gap-3 border-b border-border/40 bg-secondary/50 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">
              Compare organizations · {compared.length}/3
            </h3>
            <button
              onClick={onClearComparison}
              className="text-sm font-semibold text-primary underline"
            >
              Clear comparison
            </button>
          </div>
          {compared.length === 1 && (
            <p className="text-sm text-muted-foreground">
              Choose another organization to compare side by side.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <caption className="sr-only">
                Selected organizations, including any hidden by current filters
              </caption>
              <thead>
                <tr>
                  <th className="p-2 text-left">Attribute</th>
                  {compared.map((n) => (
                    <th key={n.id} className="p-2 text-left align-top">
                      <button
                        onClick={() => onSelect(n.id)}
                        className="text-primary hover:underline"
                      >
                        {n.id}
                      </button>
                      {!nodes.some((visible) => visible.id === n.id) && (
                        <span className="block font-normal text-muted-foreground">
                          Hidden by filters
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Service",
                    (n: GraphNode) =>
                      `${n.category}${n.categoryInferred ? " (inferred)" : ""}`,
                  ],
                  ["Grantee status", statusLabel],
                  [
                    "Recorded regional partners",
                    (n: GraphNode) => String(counts.get(n.id)),
                  ],
                  [
                    "Funding · period",
                    (n: GraphNode) =>
                      `${n.fundingAmount ?? "Not reported"} · ${n.fundingYear ?? "Period not reported"}`,
                  ],
                  [
                    "Funding scope",
                    (n: GraphNode) => n.fundingSourceLabel ?? "Not reported",
                  ],
                  [
                    "People served · period",
                    (n: GraphNode) =>
                      `${n.kpi?.latestIndividualsServed?.toLocaleString() ?? "Not reported"} · ${n.kpi?.latestPeriod ?? "Period not reported"}`,
                  ],
                ].map(([label, getter]) => (
                  <tr key={String(label)} className="border-t border-border/40">
                    <th
                      scope="row"
                      className="p-2 text-left align-top font-medium text-muted-foreground"
                    >
                      {String(label)}
                    </th>
                    {compared.map((n) => (
                      <td key={n.id} className="p-2 align-top leading-relaxed">
                        {(getter as (n: GraphNode) => string)(n)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Compare context, not rankings: funding scopes and reporting periods
            vary. Partner counts reflect documentation, not impact.
          </p>
        </section>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">
            Filtered organizations in {regionLabel}. Partner counts use the
            complete regional dataset.
          </caption>
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="p-4 text-left font-medium">Compare</th>
              <th className="p-4 text-left font-medium">Organization</th>
              <th className="p-4 text-left font-medium">Service type</th>
              <th className="p-4 text-left font-medium">Grantee status</th>
              <th className="p-4 text-right font-medium">Partners</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((n) => (
              <tr
                key={n.id}
                className={`border-t border-border/40 ${selectedId === n.id ? "bg-accent text-accent-foreground" : "hover:bg-secondary/50"}`}
              >
                <td className="p-4">
                  <input
                    className="size-4 accent-primary"
                    type="checkbox"
                    aria-label={`Compare ${n.id}`}
                    checked={comparison.includes(n.id)}
                    disabled={
                      comparison.length >= 3 && !comparison.includes(n.id)
                    }
                    onChange={() => onCompare(n.id)}
                  />
                </td>
                <th scope="row" className="p-4 text-left font-semibold">
                  <button
                    className="text-left text-primary underline-offset-4 hover:underline"
                    onClick={() => onSelect(n.id)}
                  >
                    {n.id}
                  </button>
                </th>
                <td className="p-4 leading-relaxed">
                  {n.category}
                  {n.categoryInferred && (
                    <span className="block text-muted-foreground">
                      Inferred
                    </span>
                  )}
                </td>
                <td className="p-4 leading-relaxed text-muted-foreground">
                  {statusLabel(n)}
                </td>
                <td className="p-4 text-right tabular-nums">
                  {counts.get(n.id) || (
                    <span className="text-muted-foreground">None recorded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
