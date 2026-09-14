import { reportData } from "@/lib/report-data";

export function ExecutiveSummary() {
  const stats = reportData.executiveSummary.stats;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-[var(--raisin)] mb-2">
          Key Findings
        </h2>
        <p className="text-base text-gray-600">
          This analysis of MHM&apos;s portfolio, funding, and reach identified findings that inform the ecosystem map.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col"
          >
            <div className="mb-3">
              <p className="text-4xl md:text-5xl font-bold text-[var(--cobalt)]">
                {stat.value}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--raisin)] mb-2 uppercase tracking-wide">
                {stat.label}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-12 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-2xl font-bold text-[var(--raisin)]">45</p>
            <p className="text-xs uppercase tracking-wide text-gray-600 mt-1">
              Total organizations
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--raisin)]">35</p>
            <p className="text-xs uppercase tracking-wide text-gray-600 mt-1">
              Active grants (2026)
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--raisin)]">10</p>
            <p className="text-xs uppercase tracking-wide text-gray-600 mt-1">
              Historical/closed grants
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--raisin)]">78.7K</p>
            <p className="text-xs uppercase tracking-wide text-gray-600 mt-1">
              Individuals served (total)
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--raisin)]">32.4K</p>
            <p className="text-xs uppercase tracking-wide text-gray-600 mt-1">
              Devices distributed
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--raisin)]">53</p>
            <p className="text-xs uppercase tracking-wide text-gray-600 mt-1">
              Ecosystem partners
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
