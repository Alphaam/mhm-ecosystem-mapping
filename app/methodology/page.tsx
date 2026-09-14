export const metadata = {
  title: "Methodology & Data Sources — MHM Regional Network",
};

function Source({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-muted-foreground">{children}</p>;
}

export default function MethodologyPage() {
  return (
    <main className="h-full flex-1 overflow-y-auto">
      <div className="container-wide py-10 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Methodology &amp; Data Sources
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          How this dashboard is built
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          HR&amp;A took Methodist Healthcare Ministries&apos; (MHM) own
          tracking of its Digital Equity grantees&apos; partnerships,
          standardized and enriched it, and rendered it as an interactive
          network so a region&apos;s collaboration landscape — who works with
          whom, how actively, and around what service — can be read at a
          glance instead of scanned row by row in a spreadsheet.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Source data
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The tracker records two kinds of rows for each of MHM&apos;s
            designated regions across its 76-county South Texas service
            area: documented{" "}
            <span className="font-medium text-foreground">
              grantee–organization relationships
            </span>{" "}
            (an MHM Digital Equity grantee and a partner it collaborates or
            shares funding with, evidenced by a grant report, site-visit
            note, or public source), and{" "}
            <span className="font-medium text-foreground">
              Key Regional Players
            </span>{" "}
            — additional MHM-funded or notable organizations in a region
            with no documented direct collaboration yet, added from MHM&apos;s
            Comm Impact ledger or, where that wasn&apos;t available, from
            public web and organization-site research.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Each relationship row carries a relationship type (grantee
            collaboration vs. funding relationship), a strength rating,
            a primary service category, a region assignment, and — for
            grantees — a funding amount and whether they hold an active
            2026 MHM Digital Equity grant.
          </p>
          <Source>
            Source: MHM Collaborations Tracker — Final.xlsx, Master
            Grantee-Org Sheet (v4)
          </Source>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            From spreadsheet to dataset
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A one-time export script reads both sections of the tracker,
            parses each row&apos;s free-text region field into a region
            code, and writes a static dataset the dashboard reads directly —
            re-run whenever the tracker is updated.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Name cleanup.
            </span>{" "}
            The same organization sometimes appears under slightly
            different spellings across rows (&quot;Boys and Girls Clubs of
            Laredo&quot; vs. &quot;Boys &amp; Girls Clubs of Laredo&quot;, or
            a grantee name with a program name appended in parentheses).
            These are automatically collapsed onto one canonical name,
            chosen as whichever spelling appears most often in the tracker
            — so a partnership isn&apos;t split across two near-duplicate
            nodes.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Service category.
            </span>{" "}
            The tracker&apos;s &quot;Primary Service Category&quot; column
            describes whoever is in the <em>Organization</em> column of that
            row — for a grantee, that&apos;s only recorded on rows where a{" "}
            <em>different</em> grantee names them as a partner. A grantee&apos;s
            own category is looked up the same way, from any row elsewhere
            in the tracker where it appears as someone else&apos;s partner.
            If no usable category is recorded, the existing dataset defaults to
            Digital Literacy and Device Support. The explorer labels that
            classification as inferred; it is not a verified service assessment.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Grantee status.
            </span>{" "}
            An organization shows as a <strong>Current Grantee</strong> if
            any of its own rows carry the tracker&apos;s active 2026 MHM
            Digital Equity grant flag. A recorded &quot;No&quot; is labeled
            Past Grantee; a missing active-grant value is labeled Active Status
            Unconfirmed in the details and directory. The filter groups these
            latter two together. Organizations that appear only as partners are
            labeled Partner Organizations; this does not establish their funding
            history outside this tracker.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Reading the network
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each region renders as a force-directed graph: nodes pull toward
            organizations they&apos;re connected to and push away from
            everything else, so tightly-collaborating clusters group
            together and unconnected organizations settle toward the edges.
            Node position carries no geographic meaning — it&apos;s purely a
            function of the graph&apos;s connections, not a map.
          </p>
          <ol className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Fill color</span>{" "}
              — primary service category.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Circle size
              </span>{" "}
              — equal by default, without implying relative importance. The
              Regional Partners option scales circle area by distinct recorded
              partners in the full regional dataset, regardless of active filters.
              A minimum circle size keeps organizations with no recorded partners
              visible. Funding and people-served figures are shown only with
              their reporting context in details and comparisons.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Border weight
              </span>{" "}
              — thicker for an MHM grantee, thinner for a partner
              organization that has never itself been an MHM grantee.
            </li>
            <li>
              <span className="font-medium text-foreground">Line style</span>{" "}
              — solid for a grantee collaboration, dashed for a funding
              relationship. More opaque lines mark a recorded
              &quot;Strong/Active&quot; relationship; lighter lines mark
              &quot;Weak/Existing.&quot; Heavier lines originate from current
              grantees. Lines do not show the direction of services or money.
            </li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            Hovering or focusing a node shows its name. Select a node, or
            press Enter while it has keyboard focus, to open organization details.
            Search and filters above the graph narrow the visible organizations
            and connections. Details distinguish visible partners from all
            recorded regional partners. The Directory provides a table-based
            alternative, comparisons of up to three organizations, and CSV export.
            Shared URLs preserve the region, filters, view, selection, and comparison.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Comparisons and data freshness</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Funding scopes and KPI reporting windows differ across organizations. The latest reported people-served value is a period count, not a deduplicated lifetime total; missing figures are shown as Not Reported, never as zero. A lack of recorded partners is a documentation gap, not evidence that an organization works alone or that services are absent. Snapshot dates describe when the dataset was generated, not when every source record was last verified. Record-level update dates are not available.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The Data report summarizes a 45-organization portfolio, whereas regional networks include additional partners and can include the same organization in several regions. Their totals measure different populations.</p>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">
            Known limitations
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              &quot;Home region&quot; is inferred, not stated.
            </span>{" "}
            The tracker doesn&apos;t record a stable headquarters region for
            each organization — its region field describes where a specific
            relationship happened. This dashboard infers whether a region is
            an organization&apos;s primary or secondary service area from
            how many distinct regions its own rows touch, which can disagree
            with what a reviewer familiar with an organization&apos;s actual
            footprint would conclude. The explorer therefore lists regions
            appearing in records rather than presenting a verified headquarters
            or service-coverage map. Circle borders no longer encode that inference.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Region assignments can shift between tracker revisions.
            </span>{" "}
            The tracker has gone through multiple correction passes, so a
            relationship shown in one region here may have appeared in a
            different region in an earlier version of the analysis, as
            re-verification narrowed down an organization&apos;s actual
            location.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Funding amounts are the grantee&apos;s own total, not the
              partnership&apos;s.
            </span>{" "}
            The dollar figure shown for a grantee is its own reported MHM
            award (Digital Equity theme where available, otherwise
            all-program total) — it isn&apos;t attributable to any single
            partnership shown on the graph.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              This is a working analytical tool, not a finalized deliverable.
            </span>{" "}
            It reflects the tracker at a point in time and hasn&apos;t been
            through project-manager review — treat it as a way to explore
            the underlying data, not as a citable, client-ready output on
            its own.
          </p>
        </section>
      </div>
    </main>
  );
}
