import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import type { BallEvent, DeliveryOutcome, MatchTimelineEntry } from '../../types/match';

const BALL_STYLES: Record<DeliveryOutcome, { label: string; className: string }> = {
  dot: { label: '0', className: 'border-border bg-surface-2 text-muted-foreground' },
  run: { label: '', className: 'border-border bg-surface-2 text-foreground' },
  four: { label: '4', className: 'border-sky/60 bg-sky/15 text-sky' },
  six: { label: '6', className: 'border-lime bg-lime text-background' },
  wicket: { label: 'W', className: 'border-wicket bg-wicket text-background' },
  wide: { label: 'Wd', className: 'border-amber/60 bg-amber/10 text-amber' },
  no_ball: { label: 'Nb', className: 'border-amber/60 bg-amber/10 text-amber' },
  leg_bye: { label: 'Lb', className: 'border-amber/60 bg-amber/10 text-amber' },
};

export function ballLabel(ball: BallEvent): string {
  if (ball.outcome === 'run') return String(ball.runs_off_bat);
  if (ball.outcome === 'wide' || ball.outcome === 'no_ball' || ball.outcome === 'leg_bye') {
    return ball.extras > 1 ? `${BALL_STYLES[ball.outcome].label}+${ball.extras - 1}` : BALL_STYLES[ball.outcome].label;
  }
  return BALL_STYLES[ball.outcome].label;
}

function BallChip({ ball, selected, onSelect }: { ball: BallEvent; selected: boolean; onSelect: () => void }) {
  const style = BALL_STYLES[ball.outcome];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Ball ${ball.over_label}: ${ball.commentary}`}
      className={cn(
        'flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-semibold tabular transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        style.className,
        selected && 'ring-2 ring-foreground/80 ring-offset-2 ring-offset-surface',
        !ball.is_legal && 'border-dashed'
      )}
    >
      {ballLabel(ball)}
    </button>
  );
}

function OverRow({
  entry,
  selectedIndex,
  onSelect,
}: {
  entry: MatchTimelineEntry;
  selectedIndex: number | null;
  onSelect: (ball: BallEvent) => void;
}) {
  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-border py-3 first:border-t-0">
      <span className="text-sm font-semibold tabular text-foreground">Over {entry.over}</span>
      <div className="flex flex-wrap gap-1.5">
        {entry.balls.map((ball) => (
          <BallChip
            key={ball.index}
            ball={ball}
            selected={selectedIndex === ball.index}
            onSelect={() => onSelect(ball)}
          />
        ))}
      </div>
      <span className="text-right text-xs tabular text-muted-foreground">
        <span className="font-semibold text-foreground">{entry.runs}</span> runs
        {entry.wickets > 0 && <span className="ml-2 text-wicket">{entry.wickets} wkt</span>}
      </span>
    </li>
  );
}

export function BallTimeline({
  overs,
  selectedIndex,
  onSelect,
}: {
  overs: MatchTimelineEntry[];
  selectedIndex: number | null;
  onSelect: (ball: BallEvent) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const lastOver = overs[overs.length - 1];
  const lastBallIndex = lastOver ? lastOver.balls[lastOver.balls.length - 1].index : null;

  useEffect(() => {
    const container = listRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [lastBallIndex]);

  if (overs.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No deliveries yet. Move the replay forward to see the first ball.</p>;
  }

  return (
    <div>
      <div ref={listRef} className="max-h-[360px] overflow-y-auto pr-1">
        <ol>
          {overs.map((entry) => (
            <OverRow key={entry.over} entry={entry} selectedIndex={selectedIndex} onSelect={onSelect} />
          ))}
        </ol>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <Legend label="Dot" className="border-border bg-surface-2" />
        <Legend label="Run" className="border-border bg-surface-2 text-foreground" />
        <Legend label="Four" className="border-sky/60 bg-sky/15" />
        <Legend label="Six" className="border-lime bg-lime" />
        <Legend label="Wicket" className="border-wicket bg-wicket" />
        <Legend label="Extra" className="border-amber/60 bg-amber/10" />
      </div>
    </div>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-3 w-3 rounded-full border', className)} aria-hidden="true" />
      {label}
    </span>
  );
}
