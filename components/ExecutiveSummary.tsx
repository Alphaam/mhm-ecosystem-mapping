"use client";

import { useEffect, useRef, useState } from "react";

type StatCategory = {
  name: string;
  colorVar: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  stats: { value: string; label: string }[];
};

const CATEGORIES: StatCategory[] = [
  {
    name: "Portfolio",
    colorVar: "--cobalt",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    textClass: "text-[var(--cobalt)]",
    stats: [
      { value: "45", label: "Total organizations" },
      { value: "35", label: "Active grants (2026)" },
      { value: "10", label: "Historical/closed grants" },
      { value: "53", label: "Ecosystem partners" },
    ],
  },
  {
    name: "Funding",
    colorVar: "--teal",
    bgClass: "bg-teal-50",
    borderClass: "border-teal-200",
    textClass: "text-[var(--teal)]",
    stats: [
      { value: "$22.5M", label: "Digital Equity funding awarded" },
      { value: "64", label: "Tracked ecosystem relationships" },
    ],
  },
  {
    name: "Reach & Impact",
    colorVar: "--gold",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    textClass: "text-[var(--gold)]",
    stats: [
      { value: "78.7K", label: "Individuals served (total)" },
      { value: "79K", label: "Individuals served since 2024" },
      { value: "32.4K", label: "Devices distributed" },
    ],
  },
];

function StatCard({
  value,
  label,
  category,
  index,
}: {
  value: string;
  label: string;
  category: StatCategory;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`rounded-xl border ${category.borderClass} ${category.bgClass} p-5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <p className={`text-3xl sm:text-4xl font-bold ${category.textClass} mb-1 tracking-tight`}>
        {value}
      </p>
      <p className="text-xs font-semibold text-[var(--raisin)] uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export function ExecutiveSummary() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left side - Header and description */}
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Portfolio Snapshot
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Key Findings
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              This analysis of MHM&apos;s portfolio, funding, and reach
              identified findings that inform the ecosystem map.
            </p>
          </div>

          {/* Right side - Categories */}
          <div className="space-y-10">
            {CATEGORIES.map((category) => (
              <div key={category.name}>
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: `var(${category.colorVar})` }}
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {category.name}
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {category.stats.map((stat, index) => (
                    <StatCard
                      key={stat.label}
                      value={stat.value}
                      label={stat.label}
                      category={category}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
