import { useState } from 'react';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';
import type { CatchUpResponse, MatchState } from '../../types/match';
import { useCatchUp } from '../../hooks/useCompanion';
import { SectionCard } from '../common/SectionCard';
import { ErrorState, LoadingState } from '../common/StateMessages';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '../../lib/utils';
import { EvidenceList } from './EvidenceList';

const RECAP_WINDOWS = [3, 5] as const;

const TONE_CLASS: Record<CatchUpResponse['key_moments'][number]['tone'], string> = {
  wicket: 'bg-wicket',
  boundary: 'bg-sky',
  pressure: 'bg-amber',
  neutral: 'bg-muted-foreground',
};

function RecapArticle({ recap, isStale }: { recap: CatchUpResponse; isStale: boolean }) {
  return (
    <article className="space-y-6">
      {isStale && (
        <p className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-amber">
          The replay has moved on since this recap was written. Generate it again to bring it up to date.
        </p>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Overs {recap.from_over} to {recap.to_over}
        </p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground">{recap.headline}</h3>
        <p className="mt-3 text-base leading-relaxed text-foreground/90">{recap.summary}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <h4 className="text-sm font-medium text-foreground">Key moments</h4>
          {recap.key_moments.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No wickets or boundaries in this stretch.</p>
          ) : (
            <ol className="mt-3 space-y-4 border-l border-border pl-5">
              {recap.key_moments.map((moment, index) => (
                <li key={`${moment.over_label}-${index}`} className="relative">
                  <span
                    className={cn('absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full', TONE_CLASS[moment.tone])}
                    aria-hidden="true"
                  />
                  <p className="text-xs tabular text-muted-foreground">{moment.over_label}</p>
                  <p className="text-sm font-medium text-foreground">{moment.title}</p>
                  <p className="text-sm text-muted-foreground">{moment.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-foreground">Key contributions</h4>
            {recap.key_players.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No batter scored in this stretch.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border rounded-md border border-border">
                {recap.key_players.map((player) => (
                  <li key={player.name} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-foreground">{player.name}</span>
                    <span className="text-sm tabular text-muted-foreground">
                      <span className="font-semibold text-foreground">{player.runs}</span> ({player.balls}) SR{' '}
                      {player.strike_rate.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <dl className="grid grid-cols-3 gap-3">
            {recap.statistics.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-lg font-semibold tabular text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2">
          Evidence used in this recap
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <EvidenceList items={recap.evidence} />
        </CollapsibleContent>
      </Collapsible>
    </article>
  );
}

export function CatchUpPanel({ matchId, state }: { matchId: string; state: MatchState }) {
  const [windowOvers, setWindowOvers] = useState<(typeof RECAP_WINDOWS)[number]>(3);
  const { status, recap, error, generate, reset } = useCatchUp(matchId, state.ball_index, windowOvers);

  const changeWindow = (overs: (typeof RECAP_WINDOWS)[number]) => {
    setWindowOvers(overs);
    reset();
  };

  return (
    <SectionCard
      eyebrow="Catch Me Up"
      title="What did I miss?"
      action={
        <div role="group" aria-label="Recap length" className="flex rounded-md border border-border bg-background p-0.5">
          {RECAP_WINDOWS.map((overs) => (
            <button
              key={overs}
              type="button"
              aria-pressed={windowOvers === overs}
              onClick={() => changeWindow(overs)}
              className={cn(
                'rounded-sm px-3 py-1 text-xs font-semibold transition-colors',
                windowOvers === overs ? 'bg-surface-2 text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Last {overs} overs
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">
          A short editorial recap of the most recent {windowOvers} overs, with the wickets, boundaries and player
          contributions that changed the match.
        </p>
        <Button onClick={generate} disabled={status === 'loading'} className="gap-2">
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          Generate Match Recap
        </Button>
      </div>

      <div className="mt-6">
        {status === 'loading' && <LoadingState label="Writing the recap from the replay data" />}
        {status === 'error' && error && <ErrorState message={error} onRetry={generate} />}
        {status === 'ready' && recap && <RecapArticle recap={recap} isStale={recap.last_processed_ball_index !== state.ball_index} />}
        {status === 'idle' && (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Generate a recap to see what changed in the last {windowOvers} overs.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
