import { GENERATED_AT } from "./data";
import type { Graph, GraphNode } from "./types";

export const STATUS_OPTIONS = [
  { value: "current", label: "Current grantees (2026 flag)" },
  { value: "past", label: "Past / active status unconfirmed" },
  { value: "not", label: "Partner organizations" },
];

export function statusLabel(node: GraphNode): string {
  if (node.granteeStatus === "current") return "Current grantee · 2026 flag";
  if (node.granteeStatus === "not") return "Partner organization";
  return node.activeGrant === "No"
    ? "Past grantee"
    : "Active status unconfirmed";
}

export function partnerIds(graph: Graph, id: string): Set<string> {
  return new Set(
    graph.links.flatMap((link) => {
      if (link.source === id && link.target !== id) return [link.target];
      if (link.target === id && link.source !== id) return [link.source];
      return [];
    }),
  );
}

export const snapshotLabel =
  GENERATED_AT && !Number.isNaN(Date.parse(GENERATED_AT))
    ? new Date(GENERATED_AT).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "date not recorded";
