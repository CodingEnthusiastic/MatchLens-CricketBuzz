import { cn } from '../../lib/utils';
import type { Match } from '../../types/match';
import { MapPin, Calendar, Activity } from 'lucide-react';

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function TeamMark({ name, code, align = 'left' }: { name: string; code: string; align?: 'left' | 'right' }) {
  return (
    <div className={cn('flex items-center gap-3', align === 'right' && 'md:flex-row-reverse md:text-right')}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-sm font-black tracking-wider text-lime">
        {code}
      </span>
      <span className="text-base font-bold text-foreground sm:text-lg">{name}</span>
    </div>
  );
}

export function MatchHeader({ match }: { match: Match }) {
  const [battingFirst, chasing] = match.teams;
  const inningsLabel = match.current_innings === 2 ? '2nd Innings (Chase)' : '1st Innings';

  return (
    <section aria-label="Match details" className="rounded-xl border border-border bg-surface p-3.5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="text-sky">{match.tournament}</span>
          <span className="text-border">Â·</span>
          <span>{match.match_number}</span>
          <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-foreground">{match.format}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-lime/10 px-2.5 py-0.5 text-[11px] font-semibold text-lime">
          <Activity className="h-3 w-3" aria-hidden="true" />
          <span>{inningsLabel}</span>
        </div>
      </div>

      <div className="my-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <TeamMark name={battingFirst.name} code={battingFirst.code} />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 md:text-center">VS</span>
        <TeamMark name={chasing.name} code={chasing.code} align="right" />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-sky" aria-hidden="true" />
          <span className="text-foreground">{match.venue}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-sky" aria-hidden="true" />
          <span className="text-foreground tabular">
  {match.match_date ? (isNaN(new Date(match.match_date).getTime()) ? match.match_date : dateFormatter.format(new Date(match.match_date))) : 'TBD'}
</span>
        </div>
        <div className="ml-auto text-[11px] text-muted-foreground">
          Format: 20 overs per side
        </div>
      </div>
    </section>
  );
}
