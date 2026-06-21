import { prisma } from "@/lib/db";
import {
  statusCounts,
  rates,
  byState,
  byCity,
  byEnumField,
  monthlyApplied,
  monthlyInteractions,
  interactionsByType,
} from "@/lib/analytics";
import { statusFill, INK } from "@/lib/colors";
import StatTile from "@/components/charts/StatTile";
import DonutChart from "@/components/charts/DonutChart";
import BarList from "@/components/charts/BarList";
import TrendLine from "@/components/charts/TrendLine";
import USStateMap from "@/components/charts/USStateMap";
import Funnel from "@/components/charts/Funnel";

export const metadata = {
  title: "Analytics · Scout",
};

// Pipeline funnel stages, ordered Applied → Accepted. Withdrawn/Rejected are
// outcomes, not stages, so they're left to the status donut.
const FUNNEL_ORDER = ["Applied", "Interviewing", "Offer", "Accepted"];

export default async function AnalyticsPage() {
  const [apps, interactions] = await Promise.all([
    prisma.application.findMany({
      select: {
        status: true,
        city: true,
        state: true,
        workMode: true,
        employmentType: true,
        dateApplied: true,
        createdAt: true,
      },
    }),
    prisma.interaction.findMany({ select: { type: true, date: true } }),
  ]);

  const r = rates(apps);
  const statuses = statusCounts(apps);
  const donutData = statuses
    .filter((s) => s.value > 0)
    .map((s) => ({ label: s.label, value: s.value, color: statusFill(s.key) }));

  const statusMap = new Map(statuses.map((s) => [s.key, s.value]));
  // Cumulative funnel: each stage counts every application at or beyond it, so
  // the series narrows monotonically (an app now at Offer also cleared Applied
  // and Interviewing) and share-of-top never exceeds 100%. Rejected/Withdrawn
  // drop out of the pipeline and aren't counted at any stage.
  const funnelStages = FUNNEL_ORDER.map((label, i) => ({
    label,
    value: FUNNEL_ORDER.slice(i).reduce(
      (sum, s) => sum + (statusMap.get(s) ?? 0),
      0
    ),
  }));

  const stateCounts = byState(apps);
  const cityBars = byCity(apps).map((s) => ({
    label: s.label,
    value: s.value,
    color: INK.rust,
  }));
  const workModeBars = byEnumField(apps, "workMode").map((s) => ({
    label: s.label,
    value: s.value,
    color: INK.pine,
  }));
  const employmentBars = byEnumField(apps, "employmentType").map((s) => ({
    label: s.label,
    value: s.value,
    color: INK.mossLight,
  }));

  const appliedTrend = monthlyApplied(apps);
  const interactionTrend = monthlyInteractions(interactions);
  const interactionTypeBars = interactionsByType(interactions).map((s) => ({
    label: s.label,
    value: s.value,
    color: INK.sageDeep,
  }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <p className="eyebrow">Scout · Field Log</p>
        <h1 className="page-title mt-1.5">Survey</h1>
        <p className="mt-2 max-w-prose text-sm text-moss">
          {r.total > 0
            ? `Reading the terrain across ${r.total} ${
                r.total === 1 ? "application" : "applications"
              } — outcomes, pipeline, geography, and pace.`
            : "Once you log applications and interactions, this page maps the terrain — outcomes, pipeline, geography, and pace."}
        </p>
      </section>

      {r.total === 0 ? (
        <p className="card p-6 text-sm text-moss-light">
          No applications yet. Add a few under Applications and your analytics
          will appear here.
        </p>
      ) : (
        <>
          {/* Headline rates */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile value={r.total} label="Applications" />
            <StatTile value={r.active} label="Active" hint="not closed out" />
            <StatTile
              value={`${r.responseRate}%`}
              label="Response rate"
              hint="past applied"
            />
            <StatTile value={`${r.offerRate}%`} label="Offer rate" accent />
            <StatTile value={`${r.rejectionRate}%`} label="Rejection rate" />
          </section>

          {/* Status donut + pipeline funnel */}
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-baseline gap-2.5">
                <span className="blaze" aria-hidden />
                <h2 className="section-title">By status</h2>
              </div>
              <div className="card p-5">
                <DonutChart data={donutData} centerLabel="apps" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2.5">
                <span className="blaze" aria-hidden />
                <h2 className="section-title">Pipeline</h2>
              </div>
              <div className="card p-5">
                <Funnel stages={funnelStages} />
                <p className="mt-3 text-xs text-moss-light">
                  Share is relative to applications at the top of the funnel.
                </p>
              </div>
            </div>
          </section>

          {/* Geography */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2.5">
              <span className="blaze" aria-hidden />
              <h2 className="section-title">Where the leads are</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="card p-5">
                <USStateMap counts={stateCounts} />
              </div>
              <div className="card space-y-3 p-5">
                <h3 className="eyebrow">Top locations</h3>
                <BarList
                  data={cityBars}
                  emptyMessage="No cities recorded yet."
                />
              </div>
            </div>
          </section>

          {/* Trends + breakdowns */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2.5">
              <span className="blaze" aria-hidden />
              <h2 className="section-title">Pace &amp; mix</h2>
            </div>
            <div className="card space-y-2 p-5">
              <h3 className="eyebrow">Applications over time</h3>
              <TrendLine data={appliedTrend} color={INK.rust} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="card space-y-3 p-5">
                <h3 className="eyebrow">Work mode</h3>
                <BarList
                  data={workModeBars}
                  emptyMessage="No work mode set."
                />
              </div>
              <div className="card space-y-3 p-5">
                <h3 className="eyebrow">Employment type</h3>
                <BarList
                  data={employmentBars}
                  emptyMessage="No employment type set."
                />
              </div>
            </div>
          </section>

          {/* Networking */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2.5">
              <span className="blaze" aria-hidden />
              <h2 className="section-title">Networking</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="card space-y-2 p-5">
                <h3 className="eyebrow">Interactions over time</h3>
                <TrendLine
                  data={interactionTrend}
                  color={INK.pine}
                  emptyMessage="No interactions logged yet."
                />
              </div>
              <div className="card space-y-3 p-5">
                <h3 className="eyebrow">By type</h3>
                <BarList
                  data={interactionTypeBars}
                  emptyMessage="No interactions logged yet."
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
