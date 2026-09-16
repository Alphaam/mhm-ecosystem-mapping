export interface KpiRecord {
  period: string;
  individualsServed: number | null;
  outreachEvents: number | null;
  organizationsEngaged: number | null;
  connectorsHired: number | null;
  connectorsTrained: number | null;
  connectorSessions: number | null;
}

export interface KpiDataset {
  periods: string[];
  orgs: Record<string, KpiRecord[]>;
}

/** Collapse spelling/punctuation variants so a KPI report's organization
 *  name (which drifts between the Airtable form and the network tracker,
 *  e.g. "Community Tech Network, Inc. (digitalLift)" vs "Community Tech
 *  Network (CTN)") maps onto the same graph node id. Parentheticals, "&",
 *  and — importantly — trailing corporate suffixes like ", Inc." are
 *  dropped, because the two data sources disagree on whether to include
 *  them. This runs on both the graph side (node.id) and the KPI side
 *  (Airtable org name), so both must live in this shared, client-safe
 *  module. */
export function fuzzyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inc|incorporated|llc|ltd)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface OrgKpiSummary {
  /** One row per KPI report the org appears in, oldest first. */
  records: KpiRecord[];
  /** Simple sum of "Number of individuals served" across every report on
   *  file for this org. Each report period is its own reporting window (not
   *  a running cumulative total), so this is a lifetime total across the
   *  reports collected so far. */
  totalIndividualsServed: number;
  latestIndividualsServed: number | null;
  latestPeriod: string | null;
}

/** Pure reducer over an org's KPI reports. `periodOrder` is the ordered list
 *  of period labels (oldest first) so "latest" and the table sort are
 *  deterministic regardless of the order records arrive from the source. */
export function summarizeRecords(records: KpiRecord[], periodOrder: string[]): OrgKpiSummary {
  const rank = (p: string) => {
    const i = periodOrder.indexOf(p);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const sorted = [...records].sort((a, b) => rank(a.period) - rank(b.period));
  const totalIndividualsServed = sorted.reduce((sum, r) => sum + (r.individualsServed ?? 0), 0);
  const withServed = sorted.filter((r) => r.individualsServed != null);
  const latest = withServed[withServed.length - 1] ?? null;

  return {
    records: sorted,
    totalIndividualsServed,
    latestIndividualsServed: latest?.individualsServed ?? null,
    latestPeriod: latest?.period ?? null,
  };
}
