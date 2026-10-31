import { cn } from '../../lib/utils';
import type { BallEvent, DeliveryOutcome } from '../../types/match';

const OUTCOME_LABEL: Record<DeliveryOutcome, string> = {
  dot: 'Dot ball',
  run: 'Runs',
  four: 'Boundary: four',
  six: 'Boundary: six',
  wicket: 'Wicket',
  wide: 'Wide',
  no_ball: 'No ball',
  leg_bye: 'Leg bye',
};

const OUTCOME_TONE: Record<DeliveryOutcome, string> = {
  dot: 'text-muted-foreground',
  run: 'text-foreground',
  four: 'text-sky',
  six: 'text-lime',
  wicket: 'text-wicket',
  wide: 'text-amber',
  no_ball: 'text-amber',
  leg_bye: 'text-amber',
};

export function BallInspector({ ball, isSelected }: { ball: BallEvent | null; isSelected: boolean }) {
  if (!ball) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
        Select any ball in the timeline to see exactly what happened.
      </div>
    );
  }

  return (
    <article aria-live="polite" className="rounded-md border border-border bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isSelected ? 'Selected delivery' : 'Latest delivery'} · Over {ball.over_label}
        </p>
        <span className={cn('text-sm font-semibold', OUTCOME_TONE[ball.outcome])}>{OUTCOME_LABEL[ball.outcome]}</span>
      </div>
      <p className="mt-2 text-sm text-foreground">
        {ball.bowler} to {ball.striker}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ball.commentary}</p>
      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Off the bat</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular text-foreground">{ball.runs_off_bat}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Extras</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular text-foreground">{ball.extras}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular text-foreground">{ball.total_runs}</dd>
        </div>
      </dl>
      {ball.wicket && (
        <p className="mt-3 text-xs text-wicket">
          {ball.wicket.batter} dismissed, {ball.wicket.kind}.
        </p>
      )}
    </article>
  );
}
