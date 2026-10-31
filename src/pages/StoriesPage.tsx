import { useState } from 'react';
import { getMatches, getMatchStories } from '../services/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateMessages';
import { MatchSelector } from '../components/common/MatchSelector';
import { SectionCard } from '../components/common/SectionCard';
import type { Match, StoryItem } from '../types/match';
import { cn } from '../lib/utils';
import { TrendingUp, AlertTriangle, Users, Zap } from 'lucide-react';

const KIND_META: Record<StoryItem['kind'], { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  momentum: { label: 'Momentum', icon: TrendingUp, color: 'text-lime', bg: 'bg-lime/10 border-lime/30' },
  wicket: { label: 'Wicket', icon: AlertTriangle, color: 'text-wicket', bg: 'bg-wicket/10 border-wicket/30' },
  partnership: { label: 'Partnership', icon: Users, color: 'text-sky', bg: 'bg-sky/10 border-sky/30' },
  over: { label: 'Big over', icon: Zap, color: 'text-amber', bg: 'bg-amber/10 border-amber/30' },
};

function StoryCard({ item, index }: { item: StoryItem; index: number }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  return (
    <article className={cn('flex gap-4 rounded-lg border p-5', meta.bg)}>
      <div className={cn('mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border', meta.bg)}>
        <Icon className={cn('h-5 w-5', meta.color)} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-[11px] font-semibold uppercase tracking-wider', meta.color)}>
            {meta.label}
          </span>
          <span className="text-[11px] tabular text-muted-foreground">Over {item.over_label}</span>
          <span className="ml-auto text-[11px] tabular text-muted-foreground">#{index + 1}</span>
        </div>
        <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground">{item.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
      </div>
    </article>
  );
}

function StoriesPanel({ match }: { match: Match }) {
  const [attempt, setAttempt] = useState(0);
  const stories = useAsyncData(() => getMatchStories(match.match_id), [match.match_id, attempt]);

  if (!stories.data) {
    return stories.error
      ? <ErrorState message={stories.error} onRetry={() => setAttempt(v => v + 1)} />
      : <LoadingState label="Building match stories" />;
  }

  const items = stories.data;

  if (items.length === 0) {
    return <EmptyState>No match stories for this fixture yet.</EmptyState>;
  }

  const byKind: Record<StoryItem['kind'], StoryItem[]> = {
    momentum: [],
    wicket: [],
    partnership: [],
    over: [],
  };
  for (const item of items) {
    byKind[item.kind].push(item);
  }

  const kindOrder: StoryItem['kind'][] = ['wicket', 'momentum', 'partnership', 'over'];

  return (
    <div className="space-y-8">
      {/* Chronological full list */}
      <SectionCard eyebrow="Match timeline" title="All key moments">
        <div className="space-y-3">
          {items.map((item, index) => (
            <StoryCard key={`${item.kind}-${item.ball_index}`} item={item} index={index} />
          ))}
        </div>
      </SectionCard>

      {/* By category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {kindOrder
          .filter(kind => byKind[kind].length > 0)
          .map(kind => {
            const meta = KIND_META[kind];
            const Icon = meta.icon;
            return (
              <SectionCard
                key={kind}
                eyebrow={meta.label}
                title={`${meta.label} moments`}
                action={
                  <span className={cn('flex items-center gap-1.5 text-xs font-medium', meta.color)}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {byKind[kind].length}
                  </span>
                }
              >
                <div className="space-y-3">
                  {byKind[kind].map((item, idx) => (
                    <div key={`${item.ball_index}-${idx}`} className="flex gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                      <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', meta.color.replace('text-', 'bg-'))} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                        <p className="mt-1 text-[11px] tabular text-muted-foreground">Over {item.over_label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            );
          })}
      </div>
    </div>
  );
}

export function StoriesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const matches = useAsyncData(getMatches, []);

  if (!matches.data) {
    return matches.error
      ? <ErrorState message={matches.error} />
      : <LoadingState label="Loading matches" />;
  }

  if (matches.data.length === 0) {
    return <EmptyState>No matches available.</EmptyState>;
  }

  const match = matches.data.find(m => m.match_id === selectedId) ?? matches.data[0];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Analysis</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Match Stories</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Key moments that defined the match — momentum shifts, important wickets, partnerships and standout overs. Every entry is derived from the ball-by-ball data.
        </p>
      </div>

      <MatchSelector matches={matches.data} selectedId={match.match_id} onSelect={setSelectedId} />

      <StoriesPanel key={match.match_id} match={match} />
    </div>
  );
}
