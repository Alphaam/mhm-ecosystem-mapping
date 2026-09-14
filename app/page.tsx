"use client";

import { useRef } from "react";
import Link from "next/link";
import { HeroRegionPicker } from "@/components/HeroRegionPicker";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { ExplorerQuickStart } from "@/components/ExplorerQuickStart";
import { buildGraph, REGIONS } from "@/lib/data";

export default function HomePage() {
  const findingsRef = useRef<HTMLElement>(null);

  const regions = REGIONS.map((region) => ({
    ...region,
    orgCount: buildGraph(region.code).nodes.length,
  }));

  const scrollToFindings = () => {
    findingsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="h-full flex-1 overflow-y-auto">
      {/* Split Hero Section */}
      <section className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Left side - Content */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 lg:w-3/5 lg:px-10">
          <div className="w-full max-w-xl">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--cobalt)]">
              MHM Digital Equity
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Find partners. Understand the network.
            </h1>
            <p className="mt-6 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore the organizations supporting digital equity across MHM’s South Texas service area. Look up an organization, trace its recorded partnerships, or compare organizations with their reporting context.
            </p>
            <ExplorerQuickStart />
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={scrollToFindings}
                className="px-1 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Key Findings
              </button>
              <Link
                href="/data"
                className="px-1 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                View Data
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="relative hidden h-screen lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/hero-background.jpg)" }}
          />
        </div>
      </section>

      {/* Key Findings Section */}
      <section ref={findingsRef}>
        <ExecutiveSummary />
      </section>

      {/* Ecosystem Diagrams Section */}
      <section className="bg-[var(--raisin)] px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left side - Text */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/60">
                Explore the Network
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Interactive Regional Ecosystem Maps
              </h2>
              <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed">
                An interactive map of how Methodist Healthcare Ministries&apos;
                Digital Equity grantees collaborate with partner organizations
                across its Texas service area — pick a region below to explore
                who works with whom, how actively, and around what service.
              </p>
            </div>

            {/* Right side - Region Picker */}
            <div>
              <HeroRegionPicker regions={regions} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
