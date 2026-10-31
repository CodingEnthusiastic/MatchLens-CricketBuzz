import type {
  BatterLine,
  CatchUpResponse,
  EvidenceItem,
  KeyMoment,
  StoryItem,
} from '../../types/match';
import {
  batterLine,
  countLegal,
  countWickets,
  formatOvers,
  getMatchState,
  groupByOver,
  round1,
  runRate,
  sumRuns,
  type Delivery,
  type DemoInnings,
  type OverGroup,
} from './matchEngine';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

const BOUNDARY_OUTCOMES = new Set(['four', 'six']);

export function lastOvers(deliveries: Delivery[], overCount: number): OverGroup[] {
  return groupByOver(deliveries).slice(-overCount);
}

export function buildInsights(inn: DemoInnings, ballIndex: number): string[] {
  const state = getMatchState(inn, ballIndex);
  const processed = inn.deliveries.slice(0, state.ball_index);
  const groups = groupByOver(processed);

  if (groups.length === 0) {
    return ['The replay has not started. Move forward to see insights build up.'];
  }

  const lines: string[] = [];
  const recent = groups.slice(-3);
  const earlier = groups.slice(-6, -3);
  const recentBalls = recent.flatMap((g) => g.balls);
  const recentRuns = sumRuns(recentBalls);
  const recentWickets = countWickets(recentBalls);
  const recentRate = recentRuns / recent.length;

  if (recent.length === 3) {
    lines.push(
      `The last three overs produced ${recentRuns} runs and ${plural(recentWickets, 'wicket')}.`
    );
  }

  const twoWicketOvers = groups.slice(-2).length === 2 && groups.slice(-2).every((g) => countWickets(g.balls) > 0);
  if (twoWicketOvers) {
    lines.push('Wickets in each of the last two overs have slowed the scoring.');
  } else if (earlier.length > 0) {
    const earlierRate = sumRuns(earlier.flatMap((g) => g.balls)) / earlier.length;
    const gap = recentRate - earlierRate;
    if (Math.abs(gap) >= 2) {
      lines.push(
        gap < 0
          ? `Scoring slowed to ${round1(recentRate)} runs an over, down from ${round1(earlierRate)} in the three overs before.`
          : `Scoring picked up to ${round1(recentRate)} runs an over, up from ${round1(earlierRate)} in the three overs before.`
      );
    }
  }

  const partnership = state.partnership;
  if (partnership.runs >= 20 && state.score > 0) {
    const share = Math.round((partnership.runs * 100) / state.score);
    lines.push(
      `The ${partnership.batters[0]} and ${partnership.batters[1]} partnership has added ${partnership.runs} runs from ${plural(partnership.balls, 'ball')}, ${share}% of the team total.`
    );
  }

  if (state.required_run_rate !== null && state.remaining_balls !== null && state.remaining_runs !== null) {
    const gap = round1(state.required_run_rate - state.current_run_rate);
    if (gap >= 1) {
      lines.push(
        `The required rate of ${state.required_run_rate} is ${gap} above the current rate of ${state.current_run_rate}.`
      );
    }
  }

  if (state.result) {
    lines.push(`${state.result}.`);
  }

  return lines;
}

export function buildStories(inn: DemoInnings): StoryItem[] {
  const stories: StoryItem[] = [];
  const groups = groupByOver(inn.deliveries);

  groups.forEach((group, i) => {
    if (i < 3) return;
    const previous = groups.slice(i - 3, i);
    const average = previous.reduce((total, g) => total + sumRuns(g.balls), 0) / 3;
    const runs = sumRuns(group.balls);
    const swing = runs - average;
    if (Math.abs(swing) >= 6) {
      const last = group.balls[group.balls.length - 1];
      stories.push({
        kind: 'momentum',
        title: swing > 0 ? `Momentum surges in over ${group.over}` : `Momentum drains in over ${group.over}`,
        detail: `${runs} runs against an average of ${round1(average)} across the three overs before.`,
        over_label: last.over_label,
        ball_index: last.index + 1,
      });
    }
  });

  inn.deliveries.forEach((d) => {
    if (!d.wicket) return;
    const scoreAfter = sumRuns(inn.deliveries.slice(0, d.index + 1));
    const wicketsAfter = countWickets(inn.deliveries.slice(0, d.index + 1));
    stories.push({
      kind: 'wicket',
      title: `${d.wicket.batter} is out`,
      detail: `${d.wicket.kind} off ${d.bowler}. ${scoreAfter}/${wicketsAfter} at this point.`,
      over_label: d.over_label,
      ball_index: d.index + 1,
    });
  });

  let segmentStart = 0;
  const partnershipSegments: { end: Delivery; batters: [string, string]; deliveries: Delivery[] }[] = [];
  inn.deliveries.forEach((d) => {
    if (!d.wicket) return;
    partnershipSegments.push({
      end: d,
      batters: [d.wicket.batter, d.non_striker],
      deliveries: inn.deliveries.slice(segmentStart, d.index + 1),
    });
    segmentStart = d.index + 1;
  });
  const unbroken = inn.deliveries.slice(segmentStart);
  if (unbroken.length > 0) {
    const last = unbroken[unbroken.length - 1];
    partnershipSegments.push({ end: last, batters: last.pair_after, deliveries: unbroken });
  }
  partnershipSegments.forEach((segment) => {
    const runs = sumRuns(segment.deliveries);
    if (runs < 20) return;
    stories.push({
      kind: 'partnership',
      title: `${segment.batters[0]} and ${segment.batters[1]} add ${runs}`,
      detail: `${plural(countLegal(segment.deliveries), 'ball')} at a run rate of ${runRate(runs, countLegal(segment.deliveries))}.`,
      over_label: segment.end.over_label,
      ball_index: segment.end.index + 1,
    });
  });

  groups
    .map((group) => ({ group, runs: sumRuns(group.balls) }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 2)
    .forEach(({ group, runs }) => {
      const last = group.balls[group.balls.length - 1];
      stories.push({
        kind: 'over',
        title: `Over ${group.over} yields ${runs} runs`,
        detail: `${group.balls[0].bowler} went for ${runs} in the over.`,
        over_label: last.over_label,
        ball_index: last.index + 1,
      });
    });

  return stories.sort((a, b) => a.ball_index - b.ball_index);
}

export function buildCatchUp(inn: DemoInnings, ballIndex: number, overCount: number): CatchUpResponse {
  const state = getMatchState(inn, ballIndex);
  const processed = inn.deliveries.slice(0, state.ball_index);
  const window = lastOvers(processed, overCount);
  const balls = window.flatMap((g) => g.balls);
  const batting = inn.batting_team;

  if (balls.length === 0) {
    return {
      match_id: inn.fixture.match_id,
      from_over: '-',
      to_over: '-',
      headline: 'Nothing to recap yet',
      summary: 'Move the replay forward to build a recap of the most recent overs.',
      key_moments: [],
      important_events: [],
      statistics: [],
      key_players: [],
      evidence: [],
      source: 'demo',
      last_processed_ball_index: state.ball_index,
    };
  }

  const fromOver = balls[0].over_label;
  const toOver = balls[balls.length - 1].over_label;
  const runs = sumRuns(balls);
  const wickets = countWickets(balls);
  const legal = countLegal(balls);
  const boundaries = balls.filter((d) => BOUNDARY_OUTCOMES.has(d.outcome)).length;
  const dots = balls.filter((d) => d.is_legal && d.runs_off_bat === 0 && !d.wicket).length;
  const windowStart = getMatchState(inn, balls[0].index);
  const rate = runRate(runs, legal);

  const keyMoments: KeyMoment[] = [];
  let runningScore = sumRuns(processed.slice(0, balls[0].index));
  balls.forEach((d) => {
    runningScore += d.total_runs;
    if (d.wicket) {
      keyMoments.push({
        title: `Wicket: ${d.wicket.batter}`,
        detail: `${d.wicket.kind} off ${d.bowler}. ${batting} at ${runningScore}.`,
        over_label: d.over_label,
        tone: 'wicket',
      });
    } else if (BOUNDARY_OUTCOMES.has(d.outcome)) {
      keyMoments.push({
        title: d.outcome === 'six' ? 'Maximum' : 'Boundary',
        detail: `${d.striker} ${d.outcome === 'six' ? 'hits a six' : 'finds the fence'} off ${d.bowler}.`,
        over_label: d.over_label,
        tone: 'boundary',
      });
    }
  });

  const requiredNow = state.required_run_rate;
  const requiredThen = windowStart.required_run_rate;
  if (requiredNow !== null && requiredThen !== null && requiredNow - requiredThen >= 1) {
    keyMoments.push({
      title: 'Pressure builds',
      detail: `The required rate has climbed from ${requiredThen} to ${requiredNow}.`,
      over_label: toOver,
      tone: 'pressure',
    });
  }

  const importantEvents = balls.filter((d) => d.wicket || BOUNDARY_OUTCOMES.has(d.outcome));

  const batterNames = Array.from(new Set(balls.flatMap((d) => [d.striker, d.non_striker])));
  const keyPlayers: BatterLine[] = batterNames
    .map((name) => ({
      line: batterLine(name, processed, state.batting_pair[0].name === name),
      windowRuns: balls.filter((d) => d.striker === name).reduce((total, d) => total + d.runs_off_bat, 0),
    }))
    .filter((entry) => entry.windowRuns > 0)
    .sort((a, b) => b.windowRuns - a.windowRuns)
    .slice(0, 2)
    .map((entry) => entry.line);

  const headline =
    wickets >= 2
      ? `A collapse of ${plural(wickets, 'wicket')}`
      : boundaries >= 4
        ? `Boundaries power ${runs} runs`
        : `A ${runs}-run stretch of ${overCount} overs`;

  const rateSentence = requiredNow !== null && requiredThen !== null
    ? ` The required rate moved from ${requiredThen} to ${requiredNow}.`
    : '';
  const summary =
    `${batting} scored ${runs} runs from ${plural(legal, 'legal ball')} between overs ${fromOver} and ${toOver}, ` +
    `at a rate of ${rate}. They lost ${plural(wickets, 'wicket')} and hit ${plural(boundaries, 'boundary')}, ` +
    `with ${plural(dots, 'dot ball')}.${rateSentence}`;

  const evidence: EvidenceItem[] = window.map((g) => {
    const groupRuns = sumRuns(g.balls);
    const groupWickets = countWickets(g.balls);
    const last = g.balls[g.balls.length - 1];
    return {
      kind: 'over',
      title: `Over ${g.over}`,
      detail: `${g.balls[0].bowler} conceded ${groupRuns} runs and took ${plural(groupWickets, 'wicket')}.`,
      over_range: `${g.balls[0].over_label} to ${last.over_label}`,
      ball_index: last.index + 1,
    };
  });

  return {
    match_id: inn.fixture.match_id,
    from_over: fromOver,
    to_over: toOver,
    headline,
    summary,
    key_moments: keyMoments.slice(0, 6),
    important_events: importantEvents,
    statistics: [
      { label: 'Runs', value: String(runs) },
      { label: 'Wickets', value: String(wickets) },
      { label: 'Run rate', value: rate.toFixed(2) },
      { label: 'Boundaries', value: String(boundaries) },
      { label: 'Dot balls', value: String(dots) },
      { label: 'Overs', value: formatOvers(legal) },
    ],
    key_players: keyPlayers,
    evidence,
    source: 'demo',
    last_processed_ball_index: state.ball_index,
  };
}
