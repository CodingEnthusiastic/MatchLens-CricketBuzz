import type { MatchState } from '../../types/match';
import { cn } from '../../lib/utils';

const cellClass = 'bg-surface p-5';

function Metric({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'pressure';
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular', tone === 'pressure' ? 'text-amber' : 'text-foreground')}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BatterCell({ batter }: { batter: MatchState['batting_pair'][number] }) {
  return (
    <div className={cellClass}>
      <div className="flex items-center gap-2">
        {batter.is_on_strike && <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-label="On strike" />}
        <p className="truncate text-sm font-medium text-foreground">{batter.name}</p>
        {batter.is_on_strike && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-lime">Strike</span>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular text-foreground">
        {batter.runs}
        <span className="ml-1.5 text-base font-normal text-muted-foreground">({batter.balls})</span>
      </p>
      <p className="mt-1.5 text-xs tabular text-muted-foreground">
        {batter.fours} fours, {batter.sixes} sixes, SR {batter.strike_rate.toFixed(1)}
      </p>
    </div>
  );
}

export function ScoreStrip({ state }: { state: MatchState }) {
  const [onStrike, offStrike] = state.batting_pair;
  const bowler = state.current_bowler;
  const partnership = state.partnership;
  const pressure =
    state.required_run_rate !== null && state.required_run_rate - state.current_run_rate >= 1;

  return (
    <section aria-label="Live score" className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {state.batting_team} batting
          </p>
          <p className="mt-2 flex items-baseline font-semibold leading-none tabular text-foreground">
            <span className="text-7xl sm:text-8xl">{state.score}</span>
            <span className="ml-1 text-4xl text-muted-foreground sm:text-5xl">/{state.wickets}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Overs <span className="font-medium tabular text-foreground">{state.overs}</span> of 20
          </p>
          {state.result ? (
            <p className="mt-4 inline-flex rounded-md bg-lime/15 px-3 py-1.5 text-sm font-semibold text-lime">
              {state.result}
            </p>
          ) : (
            state.target !== null && (
              <p className="mt-4 text-sm text-muted-foreground">
                Chasing <span className="font-semibold tabular text-foreground">{state.target}</span> set by{' '}
                {state.bowling_team}
              </p>
            )
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <Metric
            label="Need"
            value={state.remaining_runs !== null ? `${state.remaining_runs}` : '-'}
            hint={state.remaining_balls !== null ? `from ${state.remaining_balls} balls` : undefined}
          />
          <Metric label="Current rate" value={state.current_run_rate.toFixed(2)} hint="runs per over" />
          <Metric
            label="Required rate"
            value={state.required_run_rate !== null ? state.required_run_rate.toFixed(2) : '-'}
            hint="runs per over needed"
            tone={pressure ? 'pressure' : 'default'}
          />
          <Metric label="Wickets in hand" value={`${10 - state.wickets}`} />
        </div>
      </div>

      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <BatterCell batter={onStrike} />
        <BatterCell batter={offStrike} />
        <div className={cellClass}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Current bowler</p>
          <p className="mt-2 truncate text-sm font-medium text-foreground">{bowler.name}</p>
          <p className="mt-2 text-3xl font-semibold tabular text-foreground">
            {bowler.wickets}-{bowler.runs}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">({bowler.overs})</span>
          </p>
          <p className="mt-1.5 text-xs tabular text-muted-foreground">Economy {bowler.economy.toFixed(2)}</p>
        </div>
        <div className={cellClass}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Partnership</p>
          <p className="mt-2 truncate text-sm font-medium text-foreground">
            {partnership.batters[0]} and {partnership.batters[1]}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular text-foreground">
            {partnership.runs}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">({partnership.balls})</span>
          </p>
          <p className="mt-1.5 text-xs tabular text-muted-foreground">Since the last wicket</p>
        </div>
      </div>
    </section>
  );
}
