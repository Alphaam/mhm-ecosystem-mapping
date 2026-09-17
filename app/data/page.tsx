import { DataDashboard } from "@/components/DataDashboard";
import { getEcosystemKpiTotals } from "@/lib/kpi-source";
import type { EcosystemKpiTotals } from "@/lib/kpi";

// Live KPI sections (Individuals Served, Program Engagement) come from Airtable
// via the shared "kpi" cache tag, purged by the form-submission webhook. The
// rest of the page is the static August 2026 report snapshot. If the fetch
// fails, the dashboard falls back to the static values so the page still renders.
export default async function DataPage() {
  let live: EcosystemKpiTotals | null = null;
  try {
    live = await getEcosystemKpiTotals();
  } catch {
    live = null;
  }

  return <DataDashboard live={live} />;
}
