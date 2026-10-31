import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, PlayCircle, Trophy, Sparkles } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { getMatches } from '../services/api';
import { LoadingState, ErrorState, EmptyState } from '../components/common/StateMessages';
import { cn } from '../lib/utils';
import type { Match } from '../types/match';

export function MatchesLandingPage() {
  const [filter, setFilter] = useState<'all' | 'ipl' | 'demo'>('all');
  const [attempt, setAttempt] = useState(0);
  const matches = useAsyncData(getMatches, [attempt]);

  if (!matches.data) {
    return matches.error ? (
      <ErrorState message={matches.error} onRetry={() => setAttempt((v) => v + 1)} />
    ) : (
      <LoadingState label="Loading cricket fixtures" />
    );
  }

  const allMatches = matches.data;
  const filtered = allMatches.filter((m) => {
    if (filter === 'ipl') return m.tournament.toLowerCase().includes('indian') || m.tournament.toLowerCase().includes('ipl');
    if (filter === 'demo') return m.is_demo || m.match_id.startsWith('demo');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cricbuzz Header Banner */}
      <section className="rounded-xl border border-border bg-gradient-to-br from-surface-2 to-surface p-4 sm:p-7 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-semibold text-lime">
                <Sparkles className="h-3 w-3" />
                CRICBUZZ-STYLE MATCH HUB
              </span>
              <span className="text-xs text-muted-foreground">• {allMatches.length} Historical Matches Available</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Select a Match to Replay
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Ball-by-ball precision replay, live momentum shifts, and grounded AI assistant backed by MCC Laws & Qdrant vector retrieval.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Matches' },
              { id: 'ipl', label: 'IPL 2017' },
              { id: 'demo', label: 'Demo Fixtures' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                  filter === tab.id
                    ? 'bg-lime text-background shadow-md shadow-lime/20'
                    : 'border border-border bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      {filtered.length === 0 ? (
        <EmptyState>No matches found in this category.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((match) => {
            const [teamA, teamB] = match.teams;
            return (
              <Link
                key={match.match_id}
                to={`/match/${match.match_id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime/60 hover:bg-surface-2/80 hover:shadow-xl hover:shadow-lime/5"
              >
                {/* Card Top Metadata */}
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className="font-semibold text-foreground/90 truncate">{match.tournament}</span>
                    <span className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-bold text-sky border border-sky/30">
                      {match.match_number ? `M# ${match.match_number}` : 'T20'}
                    </span>
                  </div>

                  {/* Teams Display */}
                  <div className="my-4 space-y-2.5">
                    {/* Team A */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-9 items-center justify-center rounded-md border border-border bg-background text-xs font-black text-lime">
                          {teamA.code}
                        </span>
                        <span className="text-sm font-semibold text-foreground group-hover:text-lime transition-colors">
                          {teamA.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-muted-foreground/60 pl-3">vs</div>

                    {/* Team B */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-9 items-center justify-center rounded-md border border-border bg-background text-xs font-black text-sky">
                          {teamB.code}
                        </span>
                        <span className="text-sm font-semibold text-foreground group-hover:text-sky transition-colors">
                          {teamB.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 border-t border-border/50 pt-3">
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                      <span>{match.match_date}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between rounded-lg bg-surface-2/60 px-3 py-2 text-xs font-semibold text-lime group-hover:bg-lime group-hover:text-background transition-colors">
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="h-4 w-4" />
                      Replay Match Centre
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
