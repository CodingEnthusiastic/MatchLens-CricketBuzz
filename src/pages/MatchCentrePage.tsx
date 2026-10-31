import { useState } from 'react';
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
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const matches = useAsyncData(getMatches, [attempt]);

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

  const match = matches.data.find((item) => item.match_id === selectedId) ?? matches.data[0];

  return (
    <div className="space-y-6">
      <MatchSelector matches={matches.data} selectedId={match.match_id} onSelect={setSelectedId} />
      <SelectedMatch key={match.match_id} match={match} />
    </div>
  );
}
