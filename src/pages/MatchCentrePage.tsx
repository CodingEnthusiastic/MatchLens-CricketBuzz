import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { getMatchState, getMatches } from '../services/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateMessages';
import { MatchSelector } from '../components/common/MatchSelector';
import { MatchWorkspace } from '../components/match-centre/MatchWorkspace';
import type { Match } from '../types/match';

const START_FRACTION = 0.6;

function SelectedMatch({ match }: { match: Match }) {
  const meta = useAsyncData(() => getMatchState(match.match_id, 0), [match.match_id]);

  if (!meta.data) {
    return meta.error ? <ErrorState message={meta.error} /> : <LoadingState label="Loading the replay" />;
  }

  const total = meta.data.total_deliveries;
  return (
    <MatchWorkspace
      match={match}
      totalDeliveries={total}
      initialIndex={Math.floor(total * START_FRACTION)}
    />
  );
}

export function MatchCentrePage() {
  const { matchId } = useParams<{ matchId?: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const matches = useAsyncData(getMatches, [attempt]);

  // If a matchId is in URL, use it; otherwise fallback
  const allMatches = matches.data ?? [];
  const currentMatch =
    (matchId ? allMatches.find((m) => m.match_id === matchId) : null) ?? allMatches[0];

  // Keep URL aligned if on /match without ID or redirected
  useEffect(() => {
    if (allMatches.length > 0 && !matchId && currentMatch) {
      navigate(`/match/${currentMatch.match_id}`, { replace: true });
    }
  }, [allMatches, matchId, currentMatch, navigate]);

  if (!matches.data) {
    return matches.error ? (
      <ErrorState message={matches.error} onRetry={() => setAttempt((value) => value + 1)} />
    ) : (
      <LoadingState label="Loading matches" />
    );
  }

  if (matches.data.length === 0) {
    return <EmptyState>No matches are available yet.</EmptyState>;
  }

  const activeMatch = currentMatch ?? matches.data[0];

  const handleSelectMatch = (newMatchId: string) => {
    navigate(`/match/${newMatchId}`);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar with Hub Link & Match Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/matches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-lime transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Matches Hub</span>
        </Link>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          URL: <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sky">/match/{activeMatch.match_id}</code>
        </span>
      </div>

      {/* Match Selector Strip */}
      <MatchSelector
        matches={matches.data}
        selectedId={activeMatch.match_id}
        onSelect={handleSelectMatch}
      />

      {/* Active Workspace */}
      <SelectedMatch key={activeMatch.match_id} match={activeMatch} />
    </div>
  );
}
