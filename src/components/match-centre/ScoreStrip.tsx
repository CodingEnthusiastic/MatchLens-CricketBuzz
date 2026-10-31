import type { MatchState } from '../../types/match';
import { cn } from '../../lib/utils';
import { Target, TrendingUp, Users, ShieldAlert, Trophy } from 'lucide-react';

export function ScoreStrip({ state }: { state: MatchState }) {
  const [onStrike, offStrike] = state.batting_pair;
  const bowler = state.current_bowler;
  const partnership = state.partnership;
  const isChasing = state.target !== null;
  const pressure =
    state.required_run_rate !== null && state.required_run_rate - state.current_run_rate >= 1.5;

  return (
    <section aria-label="Live Cricbuzz-Style Match Scorecard" className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      {/* Cricbuzz Primary Score Banner */}
      <div className="border-b border-border bg-surface-2/60 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Team and Live Score */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-base font-semibold tracking-wide text-foreground sm:text-lg">
              {state.batting_team}
            </span>
            <div className="flex items-baseline gap-1.5 font-bold tabular text-foreground">
              <span className="text-3xl sm:text-4xl text-lime tracking-tight">{state.score}</span>
              <span className="text-xl sm:text-2xl text-muted-foreground">/{state.wickets}</span>
            </div>
            <span className="text-sm font-medium tabular text-muted-foreground">
              ({state.overs} / 20 ov)
            </span>
            {state.result ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-semibold text-lime">
                {state.result}
              </span>
            ) : isChasing ? (
              <span className="text-xs text-muted-foreground">
                Target <span className="font-semibold text-foreground tabular">{state.target}</span>
              </span>
            ) : null}
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1 text-muted-foreground">
              <span>CRR:</span>
              <span className="font-semibold tabular text-foreground">{state.current_run_rate.toFixed(2)}</span>
            </div>
            {state.required_run_rate !== null && (
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium',
                  pressure
                    ? 'border-amber/50 bg-amber/15 text-amber'
                    : 'border-border bg-background/80 text-foreground'
                )}
              >
                <span>REQ:</span>
                <span className="font-semibold tabular">{state.required_run_rate.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1 text-muted-foreground">
              <span>Wickets Left:</span>
              <span className="font-semibold tabular text-foreground">{10 - state.wickets}</span>
            </div>
          </div>
        </div>

        {/* Live Equation / Match Situation Callout */}
        {!state.result && isChasing && state.remaining_runs !== null && state.remaining_balls !== null && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-sky/30 bg-sky/10 px-3.5 py-2 text-xs sm:text-sm">
            <Target className="h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
            <p className="text-foreground">
              <span className="font-bold text-sky">{state.batting_team}</span> need{' '}
              <span className="font-bold tabular text-lime">{state.remaining_runs}</span> runs in{' '}
              <span className="font-bold tabular text-lime">{state.remaining_balls}</span> balls to win
              {state.required_run_rate !== null && (
                <span className="text-muted-foreground ml-1.5">
                  (RRR: <strong className="text-foreground tabular">{state.required_run_rate.toFixed(2)}</strong>)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Cricbuzz High-Density Scorecard Tables */}
      <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* Batting Card */}
        <div className="overflow-x-auto p-3.5 sm:p-5">
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Batters at Crease
            </span>
            <span className="text-[11px] text-muted-foreground">* On strike</span>
          </div>
          <table className="w-full min-w-[280px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-2 font-medium">Batter</th>
                <th className="pb-2 text-right font-medium">R</th>
                <th className="pb-2 text-right font-medium">B</th>
                <th className="pb-2 text-right font-medium">4s</th>
                <th className="pb-2 text-right font-medium">6s</th>
                <th className="pb-2 text-right font-medium">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr className="group">
                <td className="py-2.5 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    {onStrike.is_on_strike && (
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                    )}
                    <span className="truncate">{onStrike.name}</span>
                    {onStrike.is_on_strike && <span className="font-bold text-lime">*</span>}
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold tabular text-foreground">{onStrike.runs}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{onStrike.balls}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{onStrike.fours}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{onStrike.sixes}</td>
                <td className="py-2.5 text-right font-semibold tabular text-foreground">
                  {onStrike.strike_rate.toFixed(1)}
                </td>
              </tr>
              <tr className="group">
                <td className="py-2.5 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    {offStrike.is_on_strike && (
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                    )}
                    <span className="truncate">{offStrike.name}</span>
                    {offStrike.is_on_strike && <span className="font-bold text-lime">*</span>}
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold tabular text-foreground">{offStrike.runs}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{offStrike.balls}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{offStrike.fours}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{offStrike.sixes}</td>
                <td className="py-2.5 text-right font-semibold tabular text-foreground">
                  {offStrike.strike_rate.toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Mini Partnership Strip */}
          <div className="mt-3.5 flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-sky" aria-hidden="true" />
              Partnership:
            </span>
            <span className="tabular font-semibold text-foreground">
              <span className="text-lime">{partnership.runs}</span> runs off{' '}
              <span className="text-muted-foreground">({partnership.balls}b)</span>
            </span>
          </div>
        </div>

        {/* Bowling & Match Context Card */}
        <div className="overflow-x-auto p-3.5 sm:p-5">
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current Bowler
            </span>
            <span className="text-[11px] text-muted-foreground">{state.bowling_team}</span>
          </div>
          <table className="w-full min-w-[280px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-2 font-medium">Bowler</th>
                <th className="pb-2 text-right font-medium">O</th>
                <th className="pb-2 text-right font-medium">M</th>
                <th className="pb-2 text-right font-medium">R</th>
                <th className="pb-2 text-right font-medium">W</th>
                <th className="pb-2 text-right font-medium">ECO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2.5 font-medium text-foreground">
                  <span className="truncate">{bowler.name}</span>
                </td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{bowler.overs}</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">0</td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{bowler.runs}</td>
                <td className="py-2.5 text-right font-bold tabular text-wicket">{bowler.wickets}</td>
                <td className="py-2.5 text-right font-semibold tabular text-foreground">
                  {bowler.economy.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Recent Deliveries Strip (Last 6 Balls) */}
          <div className="mt-3.5 flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
              Recent balls:
            </span>
            <div className="flex items-center gap-1.5">
              {state.recent_events.slice(-6).map((ev) => (
                <span
                  key={ev.index}
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular',
                    ev.outcome === 'wicket'
                      ? 'bg-wicket text-white'
                      : ev.outcome === 'four' || ev.outcome === 'six'
                      ? 'bg-lime text-background font-black'
                      : ev.outcome === 'dot'
                      ? 'border border-border bg-surface-2 text-muted-foreground'
                      : 'border border-border bg-surface-2 text-foreground'
                  )}
                >
                  {ev.outcome === 'wicket' ? 'W' : ev.outcome === 'run' ? ev.runs_off_bat : ev.total_runs}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
