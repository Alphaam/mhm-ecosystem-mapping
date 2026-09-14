"use client";

import { useEffect, useRef } from "react";
import { REGIONS } from "@/lib/data";
import { partnerIds, snapshotLabel, statusLabel } from "@/lib/explorer";
import type { Graph, GraphNode } from "@/lib/types";

export function OrganizationDetails({
  node,
  graph,
  visibleIds,
  onSelect,
  onClose,
  onFocus,
  onShare,
}: {
  node: GraphNode;
  graph: Graph;
  visibleIds: Set<string>;
  onSelect: (id: string) => void;
  onClose: () => void;
  onFocus: () => void;
  onShare: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const partners = [...partnerIds(graph, node.id)].sort();
  const visibleCount = partners.filter(
    (id) => visibleIds.has(id) && visibleIds.has(node.id),
  ).length;
  const regionCodes = [
    ...new Set([...node.primaryRegionCodes, ...node.secondaryRegionCodes]),
  ];
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <aside
      aria-labelledby="organization-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className="fixed inset-x-2 bottom-2 z-30 max-h-[65dvh] overflow-y-auto overscroll-contain rounded-xl border border-border/50 bg-card text-card-foreground shadow-xl md:sticky md:inset-x-auto md:bottom-auto md:top-4 md:z-10 md:max-h-[80dvh] md:w-72 md:shrink-0 md:shadow-sm lg:w-80"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border/40 bg-card px-5 py-4 text-card-foreground">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm font-medium text-primary">
            Organization details
          </p>
          <h2
            ref={titleRef}
            tabIndex={-1}
            id="organization-title"
            className="text-pretty text-xl font-semibold tracking-tight outline-none"
          >
            {node.id}
          </h2>
          <p className="text-sm text-muted-foreground">{statusLabel(node)}</p>
        </div>
        <button
          className="explorer-button shrink-0"
          onClick={onClose}
          aria-label="Close organization details"
        >
          ×
        </button>
      </div>
      <div className="flex flex-col gap-5 p-5">
        {!visibleIds.has(node.id) && (
          <p className="rounded-lg bg-secondary p-3 text-sm leading-relaxed text-secondary-foreground">
            This organization is hidden by the current filters. Its details
            remain available; clear filters to see it in the network.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="explorer-button" onClick={onFocus}>
            Focus on this network
          </button>
          <button className="explorer-button" onClick={onShare}>
            Copy link
          </button>
        </div>
        <dl className="flex flex-col gap-4 text-sm">
          <Detail label="Service type" value={node.category} />
          <Detail label="Service subsector" value={node.subsector} />
          <Detail
            label="Classification basis"
            value={
              node.categoryInferred
                ? "Inferred default · not verified"
                : "Recorded in tracker · not independently verified"
            }
          />
          <Detail
            label="Recorded location / regional context"
            value={node.serviceArea}
          />
          <Detail
            label="Regions appearing in records"
            value={
              regionCodes
                .map(
                  (code) => REGIONS.find((r) => r.code === code)?.label ?? code,
                )
                .join("; ") || "Not reported"
            }
          />
        </dl>
        <section
          className="flex flex-col gap-3 border-t border-border/40 pt-4"
          aria-label="Reported metrics"
        >
          <h3 className="font-semibold">Reported funding & reach</h3>
          <dl className="flex flex-col gap-4 text-sm">
            <Detail
              label="Recorded funding"
              value={node.fundingAmount ?? "Not reported"}
            />
            <Detail
              label="Funding period"
              value={node.fundingYear ?? "Not reported"}
            />
            <Detail
              label="Funding scope / source"
              value={node.fundingSourceLabel ?? "Not reported"}
            />
            <Detail
              label={`People served · ${node.kpi?.latestPeriod ?? "period not reported"}`}
              value={
                node.kpi?.latestIndividualsServed?.toLocaleString() ??
                "Not reported"
              }
            />
          </dl>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Reporting periods and funding scopes vary. These figures are not
            necessarily comparable across organizations.
          </p>
          {node.kpi && (
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-primary">
                View reporting history
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="pb-2 text-left text-muted-foreground">
                    Reported individuals, by reporting window. Counts are not
                    deduplicated across periods.
                  </caption>
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Period</th>
                      <th className="py-2 text-right">Served</th>
                    </tr>
                  </thead>
                  <tbody>
                    {node.kpi.records.map((r, i) => (
                      <tr
                        key={`${r.period}-${i}`}
                        className="border-t border-border/40"
                      >
                        <td className="py-2">{r.period}</td>
                        <td className="py-2 text-right">
                          {r.individualsServed?.toLocaleString() ??
                            "Not reported"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </section>
        <section
          className="flex flex-col gap-3 border-t border-border/40 pt-4"
          aria-label="Recorded partners"
        >
          <h3 className="font-semibold">
            Partners in this region{" "}
            <span className="text-muted-foreground">({partners.length})</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            {visibleCount} visible with current filters · {partners.length}{" "}
            recorded
          </p>
          {partners.length === 0 ? (
            <p className="rounded-lg bg-secondary p-3 text-sm leading-relaxed text-secondary-foreground">
              No partnerships recorded in this region. This is not evidence that
              the organization works alone.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {partners.map((id) => {
                const links = graph.links.filter(
                  (l) =>
                    (l.source === node.id && l.target === id) ||
                    (l.target === node.id && l.source === id),
                );
                const relationships = [
                  ...new Set(
                    links.map(
                      (l) =>
                        `${l.relationshipType ?? "Type not reported"} · ${l.relationshipStrength ?? "Activity not reported"}`,
                    ),
                  ),
                ];
                return (
                  <li key={id} className="flex flex-col gap-1">
                    <button
                      className="text-left text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      onClick={() => onSelect(id)}
                    >
                      {id} <span aria-hidden="true">→</span>
                    </button>
                    {relationships.map((r) => (
                      <p
                        key={r}
                        className="text-sm leading-relaxed text-muted-foreground"
                      >
                        {r}
                      </p>
                    ))}
                    {!visibleIds.has(id) && (
                      <span className="text-sm text-muted-foreground">
                        Hidden by filters
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <p className="border-t border-border/40 pt-4 text-sm leading-relaxed text-muted-foreground">
          Snapshot generated {snapshotLabel}. Record-level update dates are not
          available. Classifications and regional membership may be inferred;
          this dataset has not been independently verified.
        </p>
      </div>
    </aside>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium leading-relaxed">{value}</dd>
    </div>
  );
}
