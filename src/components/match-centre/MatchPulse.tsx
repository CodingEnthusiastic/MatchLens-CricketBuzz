import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { MatchState, MatchTimelineEntry } from '../../types/match';
import { SectionCard } from '../common/SectionCard';
import { OverRunsChart, ScoringProgressChart } from './OverCharts';

function sumOvers(entries: MatchTimelineEntry[]) {
  return {
    runs: entries.reduce((total, e) => total + e.runs, 0),
    wickets: entries.reduce((total, e) => total + e.wickets, 0),
    dots: entries.reduce((total, e) => total + e.balls.filter((b) => b.is_legal && b.runs_off_bat === 0 && !b.wicket).length, 0),
    overs: entries.length,
  };
}

function StatTile({ label, value, hint, icon }: { label: string; value: string; hint: string; icon?: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <p className="text-2xl font-semibold tabular text-foreground">{value}</p>
        {icon}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function MatchPulse({
  state,
  overs,
  insights,
}: {
  state: MatchState;
  overs: MatchTimelineEntry[];
  insights: string[];
}) {
  const recent = sumOvers(overs.slice(-3));
  const previous = sumOvers(overs.slice(-6, -3));
  const recentRate = recent.overs > 0 ? recent.runs / recent.overs : 0;
  const previousRate = previous.overs > 0 ? previous.runs / previous.overs : null;
  const trendDelta = previousRate === null ? 0 : recentRate - previousRate;
  const share = state.score > 0 ? Math.round((state.partnership.runs / state.score) * 100) : 0;
  const firstRecentOver = overs.length > 0 ? overs[Math.max(overs.length - 3, 0)].over : null;
  const lastOver = overs.length > 0 ? overs[overs.length - 1].over : null;

  const TrendIcon = trendDelta > 0.25 ? ArrowUpRight : trendDelta < -0.25 ? ArrowDownRight : Minus;
  const trendTone = trendDelta > 0.25 ? 'text-lime' : trendDelta < -0.25 ? 'text-wicket' : 'text-muted-foreground';

  return (
    <SectionCard
      eyebrow="Analytics from the replay"
      title="Match Pulse"
      action={<p className="text-xs text-muted-foreground">Every figure is computed from the deliveries so far</p>}
    >
      {overs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Move the replay forward to build the scoring picture.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Runs, last 3 overs"
              value={String(recent.runs)}
              hint={firstRecentOver !== null && lastOver !== null ? `Overs ${firstRecentOver} to ${lastOver}` : ''}
            />
            <StatTile
              label="Wickets, last 3 overs"
              value={String(recent.wickets)}
              hint={`${recent.dots} dot balls in that spell`}
            />
            <StatTile
              label="Run rate trend"
              value={recentRate.toFixed(1)}
              hint={
                previousRate === null
                  ? 'Runs an over, last 3 overs'
                  : `Against ${previousRate.toFixed(1)} in the 3 overs before`
              }
              icon={previousRate !== null ? <TrendIcon className={`h-5 w-5 ${trendTone}`} aria-hidden="true" /> : undefined}
            />
            <StatTile
              label="Partnership share"
              value={`${share}%`}
              hint={`${state.partnership.runs} of ${state.score} team runs`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">Scoring progression</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-lime" aria-hidden="true" /> Team runs
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 border-t border-dashed border-sky" aria-hidden="true" /> Pace to target
                  </span>
                </div>
              </div>
              <ScoringProgressChart overs={overs} />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">Runs per over</h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-sm bg-wicket" aria-hidden="true" /> Over with a wicket
                </span>
              </div>
              <OverRunsChart overs={overs} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">What the numbers say</h3>
            <ul className="mt-3 space-y-2.5">
              {insights.map((insight) => (
                <li key={insight} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky" aria-hidden="true" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
