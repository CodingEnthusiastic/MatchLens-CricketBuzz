import { useMemo, useState } from 'react';
import type { Match } from '../../types/match';
import { getBallTimeline, getMatchInsights, getMatchState } from '../../services/api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAskMatchLens } from '../../hooks/useCompanion';
import { useReplay } from '../../hooks/useReplay';
import { ErrorState, LoadingState } from '../common/StateMessages';
import { SectionCard } from '../common/SectionCard';
import { AskMatchLens } from './AskMatchLens';
import { BallInspector } from './BallInspector';
import { BallTimeline } from './BallTimeline';
import { CatchUpPanel } from './CatchUpPanel';
import { MatchEvidencePanel } from './MatchEvidencePanel';
import { MatchHeader } from './MatchHeader';
import { MatchPulse } from './MatchPulse';
import { ReplayControls } from './ReplayControls';
import { ScoreStrip } from './ScoreStrip';

export function MatchWorkspace({
  match,
  totalDeliveries,
  initialIndex,
}: {
  match: Match;
  totalDeliveries: number;
  initialIndex: number;
}) {
  const matchId = match.match_id;
  const replay = useReplay(matchId, totalDeliveries, initialIndex);
  const { index } = replay;

  const state = useAsyncData(() => getMatchState(matchId, index), [matchId, index]);
  const timeline = useAsyncData(() => getBallTimeline(matchId, index), [matchId, index]);
  const insights = useAsyncData(() => getMatchInsights(matchId, index), [matchId, index]);
  const chat = useAskMatchLens(matchId, index);

  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);

  const overs = useMemo(() => timeline.data ?? [], [timeline.data]);
  const latestBall = useMemo(() => {
    const balls = overs.flatMap((entry) => entry.balls);
    return balls.length > 0 ? balls[balls.length - 1] : null;
  }, [overs]);
  const inspectedBall = useMemo(() => {
    const balls = overs.flatMap((entry) => entry.balls);
    return balls.find((ball) => ball.index === selectedBallIndex) ?? latestBall;
  }, [overs, selectedBallIndex, latestBall]);

  const latestResponse = useMemo(() => {
    const reversed = [...chat.messages].reverse();
    return reversed.find((message) => message.response)?.response ?? null;
  }, [chat.messages]);

  if (!state.data) {
    return state.error ? (
      <ErrorState message={state.error} />
    ) : (
      <LoadingState label="Loading the match state" />
    );
  }

  const currentState = state.data;

  return (
    <div className="space-y-6">
      <MatchHeader match={match} />
      <ScoreStrip state={currentState} />
      <ReplayControls
        state={currentState}
        isPlaying={replay.isPlaying}
        speed={replay.speed}
        atStart={replay.atStart}
        atEnd={replay.atEnd}
        error={replay.error}
        onPlay={replay.play}
        onPause={replay.pause}
        onPrevious={replay.previous}
        onNext={replay.next}
        onSeek={replay.seek}
        onSpeedChange={replay.setSpeed}
      />

      {timeline.error && <ErrorState message={timeline.error} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard eyebrow="Ball by ball" title="Over timeline" className="h-full">
            <BallTimeline
              overs={overs}
              selectedIndex={inspectedBall?.index ?? null}
              onSelect={(ball) => setSelectedBallIndex(ball.index)}
            />
          </SectionCard>
        </div>
        <SectionCard eyebrow="Selected delivery" title="Ball detail">
          <BallInspector ball={inspectedBall} isSelected={selectedBallIndex !== null} />
        </SectionCard>
      </div>

      <MatchPulse state={currentState} overs={overs} insights={insights.data ?? []} />

      <CatchUpPanel matchId={matchId} state={currentState} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AskMatchLens
          state={currentState}
          messages={chat.messages}
          pending={chat.pending}
          onSend={chat.send}
        />
        <MatchEvidencePanel match={match} state={currentState} response={latestResponse} />
      </div>
    </div>
  );
}
