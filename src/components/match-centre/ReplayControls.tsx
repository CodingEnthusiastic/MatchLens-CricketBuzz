import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { MatchState } from '../../types/match';
import { REPLAY_SPEEDS, type ReplaySpeed } from '../../hooks/useReplay';
import { Button } from '../ui/button';
import { DemoReplayBadge } from '../common/DemoReplayBadge';
import { cn } from '../../lib/utils';

interface ReplayControlsProps {
  state: MatchState;
  isPlaying: boolean;
  speed: ReplaySpeed;
  atStart: boolean;
  atEnd: boolean;
  error: string | null;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (ballIndex: number) => void;
  onSpeedChange: (speed: ReplaySpeed) => void;
}

export function ReplayControls({
  state,
  isPlaying,
  speed,
  atStart,
  atEnd,
  error,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeek,
  onSpeedChange,
}: ReplayControlsProps) {
  const current = state.last_ball?.over_label ?? '0.0';
  const progress = state.total_deliveries > 0 ? Math.round((state.ball_index / state.total_deliveries) * 100) : 0;

  return (
    <section aria-label="Replay controls" className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DemoReplayBadge />
          <p className="text-sm text-muted-foreground">
            Over <span className="font-semibold tabular text-foreground">{current}</span>
            <span className="mx-2 text-border">|</span>
            Delivery <span className="tabular text-foreground">{state.ball_index}</span> of{' '}
            <span className="tabular text-foreground">{state.total_deliveries}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={atStart}
            aria-label="Previous ball"
            className="border-border bg-surface-2 text-foreground hover:bg-surface-2/80"
          >
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            disabled={!isPlaying && atEnd}
            aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
            className="h-10 w-10"
          >
            {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={atEnd}
            aria-label="Next ball"
            className="border-border bg-surface-2 text-foreground hover:bg-surface-2/80"
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div role="group" aria-label="Replay speed" className="ml-2 flex rounded-md border border-border bg-background p-0.5">
            {REPLAY_SPEEDS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={speed === option}
                onClick={() => onSpeedChange(option)}
                className={cn(
                  'rounded-sm px-2.5 py-1 text-xs font-semibold tabular transition-colors',
                  speed === option ? 'bg-lime text-background' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={state.total_deliveries}
          value={state.ball_index}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Replay progress"
          aria-valuetext={`${progress}% through the replay`}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-lime"
        />
        <span className="w-10 shrink-0 text-right text-xs font-medium tabular text-muted-foreground">{progress}%</span>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-wicket">
          The replay could not move forward: {error}
        </p>
      )}
    </section>
  );
}
