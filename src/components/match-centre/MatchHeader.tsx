import { cn } from '../../lib/utils';
import type { Match } from '../../types/match';

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function TeamMark({ name, code, align = 'left' }: { name: string; code: string; align?: 'left' | 'right' }) {
  return (
    <div className={cn('flex items-center gap-4', align === 'right' && 'md:flex-row-reverse md:text-right')}>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-base font-semibold tracking-wide text-foreground">
        {code}
      </span>
      <span className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">{name}</span>
    </div>
  );
}

export function MatchHeader({ match }: { match: Match }) {
  const [battingFirst, chasing] = match.teams;
  const inningsLabel = match.current_innings === 2 ? '2nd innings, chase' : '1st innings';

  return (
    <section aria-label="Match details" className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs uppercase tracking-wider text-muted-foreground">
        <span>{match.tournament}</span>
        <span aria-hidden="true">/</span>
        <span>{match.match_number}</span>
        <span className="ml-1 rounded-sm bg-surface-2 px-1.5 py-0.5 font-medium text-foreground">{match.format}</span>
      </div>

      <div className="mt-5 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <TeamMark name={battingFirst.name} code={battingFirst.code} />
        <span className="text-sm font-medium text-muted-foreground md:text-center">vs</span>
        <TeamMark name={chasing.name} code={chasing.code} align="right" />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Venue</dt>
          <dd className="mt-1 text-sm text-foreground">{match.venue}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Date</dt>
          <dd className="mt-1 text-sm tabular text-foreground">{dateFormatter.format(new Date(match.match_date))}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Current innings</dt>
          <dd className="mt-1 text-sm text-foreground">{inningsLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Format</dt>
          <dd className="mt-1 text-sm text-foreground">Twenty20, {match.total_balls_per_innings / 6} overs a side</dd>
        </div>
      </dl>
    </section>
  );
}
