"use client";

import { reportData } from "@/lib/report-data";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3C4ED6", "#5563E1", "#7080E8", "#8B9DEF", "#A6BAF6"];
const COLORS_ACCENT = ["#FF6B6B", "#FFA550", "#FFD93D", "#6BCB77", "#4D96FF"];

export default function DataPage() {
  return (
    <main className="bg-gray-50">
      <div className="container-wide py-10 sm:py-14">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
            Data &amp; Ecosystem Analysis
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--raisin)] sm:text-4xl">
            MHM Digital Equity Ecosystem Analysis
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            Reported findings from the August 2026 ecosystem mapping analysis. This report summarizes a 45-organization portfolio; the regional explorer also includes partner organizations. Counts use different populations and should not be directly equated. This working dataset is not independently verified.
          </p>
        </div>

        {/* Portfolio Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-6">
            Portfolio Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-[var(--cobalt)] mb-2">45</p>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Total Organizations</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-[var(--cobalt)] mb-2">35</p>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Active Grants (2026)</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-[var(--cobalt)] mb-2">10</p>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Historical/Closed Grants</p>
            </div>
          </div>
        </section>

        {/* Organizations by Primary Service */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Organizations by Primary Service
          </h2>
          <p className="text-gray-600 mb-8">
            Education, digital equity, and health are the three largest primary service categories of the 45-organization portfolio.
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.organizationsByService}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 280, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={270} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3C4ED6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Organizations by Geography */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Organizations by Geography
          </h2>
          <p className="text-gray-600 mb-8">
            While San Antonio Metropolitan Statistical Area has the largest concentration of grantees, the portfolio's reach extends to rural counties and along the border.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.organizationsByGeography}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6BCB77" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Funding */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            DE Recent Funding
          </h2>
          <p className="text-gray-600 mb-8">
            Three of 20 funded grantees – Human I-T, Computdopt, and City of Pharr – account for $2.1 million of reported spending – about half of the total $4.3 million spending reported.
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.recentFunding.ytdGrantFundsSpent.slice(0, 15)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="organization" type="category" width={190} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toLocaleString() : value}`} />
                <Bar dataKey="amount" fill="#3C4ED6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Total Funding Trends */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            DE Total Funding
          </h2>
          <p className="text-gray-600 mb-8">
            YTD grant spending grew from $5.8 million at 2024 Year-End to $7.6 million at 2025 Year-End from reported organizations. Spending in 2026 is on track to exceed both 2024 and 2025.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.totalFunding.ytdGrantFundsSpent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `$${typeof value === 'number' ? (value / 1000000).toFixed(1) : value}M`} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3C4ED6"
                  strokeWidth={3}
                  dot={{ fill: "#3C4ED6", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* MHM Total Funding Context */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Total MHM Funding
          </h2>
          <p className="text-gray-600 mb-8">
            Digital Equity is still a relatively small, recent slice of a much larger health-focused portfolio, making up about 7% of MHM's funded universe.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-[var(--cobalt)] mb-2">$1.19B</p>
              <p className="text-sm font-medium text-gray-700">Awarded across 3,108 grants to 528 organizations since 1996</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-[var(--cobalt)] mb-2">$249M</p>
              <p className="text-sm font-medium text-gray-700">Awarded from 2021-2025 across 430 orgs</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-[var(--cobalt)] mb-2">$43.9M</p>
              <p className="text-sm font-medium text-gray-700">Awarded to organizations in a rural county</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-[#6BCB77] mb-2">$22.5M</p>
              <p className="text-sm font-medium text-gray-700 mb-4">Digital Equity - Awarded total</p>
              <p className="text-2xl font-bold text-[#6BCB77]">7%</p>
              <p className="text-sm font-medium text-gray-700">Of all MHM organizations funded</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-[#6BCB77] mb-2">34</p>
              <p className="text-sm font-medium text-gray-700">Active grant organizations</p>
            </div>
          </div>
        </section>

        {/* Individuals Served */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Individuals Served
          </h2>
          <p className="text-gray-600 mb-8">
            Despite representing a small share of MHM's overall spending, digital equity programs are serving a growing number of individuals, with totals more than tripling from the first half of 2024 to year-end.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[var(--raisin)] mb-4">Individuals Served</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.individualsServed.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                    <Bar dataKey="count" fill="#3C4ED6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong className="text-[var(--raisin)]">{reportData.individualsServed.totalServed.toLocaleString()}</strong> total individuals served across reported periods
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--raisin)] mb-4">Demographic Trends</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-[var(--raisin)] mb-1">Hispanic/Latino Residents</p>
                  <p className="text-sm text-gray-600">{reportData.individualsServed.demographics.hispanicLatino} of participants</p>
                  <p className="text-xs text-gray-500 mt-2">Where reported, Hispanic/Latino residents are consistently the largest group served</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-[var(--raisin)] mb-1">Household Income</p>
                  <p className="text-sm text-gray-600">{reportData.individualsServed.demographics.householdIncomeUnder35k} under $35,000</p>
                  <p className="text-xs text-gray-500 mt-2">Household income skews low where reported</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Device Distribution */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Device Distribution
          </h2>
          <p className="text-gray-600 mb-8">
            Device distribution has fluctuated year to year, peaking at nearly 14,000 units in 2024 year-end before settling to roughly 10,000 in the latest period.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.deviceDistribution.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                <Bar dataKey="count" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <strong className="text-[var(--raisin)]">{reportData.deviceDistribution.totalDevices.toLocaleString()}</strong> total devices distributed across all reported periods
          </p>
        </section>

        {/* Program Engagement */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Program Engagement
          </h2>
          <p className="text-gray-600 mb-8">
            Grantees are hosting more outreach events while working with a smaller, more consistent set of partner organizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[var(--raisin)] mb-4">Community Outreach Events</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.programEngagement.communityOutreachEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFA550" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong className="text-[var(--raisin)]">{reportData.programEngagement.totalOutreachEvents}</strong> total outreach events across reported periods
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--raisin)] mb-4">Partner Organizations Engaged</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.programEngagement.partnerOrganizationsEngaged}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6BCB77" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong className="text-[var(--raisin)]">{reportData.programEngagement.totalPartnerEngagements}</strong> total partner-organization engagements across reported periods
              </p>
            </div>
          </div>
        </section>

        {/* Collaboration Network */}
        <section className="mb-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-[var(--raisin)] mb-2">
            Collaboration Network
          </h2>
          <p className="text-gray-600 mb-8">
            64 tracked relationships link 29 organizations, with most organizations naming a partner without mutual confirmation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-[var(--raisin)] mb-4">Relationship Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "One-Directional", value: 46 },
                        { name: "Confirmed - Mutual", value: 18 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3C4ED6" />
                      <Cell fill="#A0AEC0" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--raisin)] mb-4">Most Connected Organizations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportData.collaborationNetwork.mostConnectedOrganizations.map((org, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{org.org}</span>
                    <span className="inline-block bg-[var(--cobalt)] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {org.connections}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--raisin)]">Key Patterns</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-[var(--raisin)] text-sm mb-2">DigitalLIFT is a central hub</p>
              <p className="text-sm text-gray-600">
                {reportData.collaborationNetwork.relationshipPatterns.digitalLiftAsHub}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-[var(--raisin)] text-sm mb-2">Reach extends beyond grantees</p>
              <p className="text-sm text-gray-600">
                {reportData.collaborationNetwork.relationshipPatterns.relationshipsExtendBeyondGrantees}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-[var(--raisin)] text-sm mb-2">Mutual partnerships are rare</p>
              <p className="text-sm text-gray-600">
                {reportData.collaborationNetwork.relationshipPatterns.mutualPartnershipsRare}
              </p>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-[var(--raisin)] mb-8">
            Data Sources & Methodology
          </h2>
          <p className="text-gray-600 mb-8">
            HR&A's analysis of MHM's grantee portfolio draws on six MHM data sources, spanning narrative reports, quantitative KPI exports, and the Fluxx grant roster.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-[var(--cobalt)] mb-3">Year-End Report PDFs</h3>
              <p className="text-2xl font-bold text-[var(--raisin)] mb-2">18 grantees</p>
              <p className="text-xs uppercase tracking-wide text-gray-600">2024</p>
              <p className="text-xs text-gray-600 mt-3">Individual narrative PDFs including grant finance summaries</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-[var(--cobalt)] mb-3">Fluxx Progress Reports</h3>
              <p className="text-2xl font-bold text-[var(--raisin)] mb-2">18-34 grantees</p>
              <p className="text-xs uppercase tracking-wide text-gray-600">2024-2026</p>
              <p className="text-xs text-gray-600 mt-3">Progress Reports consolidated in excel reports</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-[var(--cobalt)] mb-3">KPI Data Exports</h3>
              <p className="text-2xl font-bold text-[var(--raisin)] mb-2">19-20 grantees</p>
              <p className="text-xs uppercase tracking-wide text-gray-600">2024-2025</p>
              <p className="text-xs text-gray-600 mt-3">4 CSV exports highlighting reach, skills, and devices</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
