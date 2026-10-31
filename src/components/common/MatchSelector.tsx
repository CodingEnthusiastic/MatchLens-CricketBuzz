import { cn } from '../../lib/utils';
import type { Match } from '../../types/match';

export function MatchSelector({
  matches,
  selectedId,
  onSelect,
}: {
  matches: Match[];
  selectedId: string;
  onSelect: (matchId: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Select a match" className="flex gap-2 overflow-x-auto pb-1">
      {matches.map((match) => {
        const active = match.match_id === selectedId;
        const [a, b] = match.teams;
        return (
          <button
            key={match.match_id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(match.match_id)}
            className={cn(
              'flex min-w-[210px] flex-col items-start rounded-md border px-4 py-2.5 text-left transition-colors',
              active
                ? 'border-lime/50 bg-surface-2 text-foreground'
                : 'border-border bg-surface text-muted-foreground hover:border-sky/40 hover:text-foreground'
            )}
          >
            <span className="text-[11px] uppercase tracking-wider">{match.match_number}</span>
            <span className="mt-0.5 text-sm font-medium">
              {a.code} <span className="text-muted-foreground">vs</span> {b.code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
