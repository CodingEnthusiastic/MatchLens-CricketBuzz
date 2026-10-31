import type {
  BallEvent,
  BatterLine,
  BowlerLine,
  DeliveryOutcome,
  Match,
  MatchState,
  MatchTimelineEntry,
  Partnership,
} from '../../types/match';
import type { FixtureMatch } from '../../data/demo/fixtures';

const BALLS_PER_OVER = 6;
const OVERS_PER_INNINGS = 20;
const WICKET_KINDS = ['caught', 'bowled', 'lbw', 'caught', 'stumped', 'run out', 'caught', 'bowled', 'caught'];

export interface Delivery extends BallEvent {
  pair_after: [string, string];
}

export interface DemoInnings {
  fixture: FixtureMatch;
  deliveries: Delivery[];
  target: number;
  legal_total: number;
  start_pair: [string, string];
  batting_team: string;
  bowling_team: string;
}

export const round1 = (value: number) => Math.round(value * 10) / 10;
export const round2 = (value: number) => Math.round(value * 100) / 100;

export function formatOvers(legalBalls: number): string {
  return `${Math.floor(legalBalls / BALLS_PER_OVER)}.${legalBalls % BALLS_PER_OVER}`;
}

export function runRate(runs: number, legalBalls: number): number {
  return legalBalls > 0 ? round2((runs * BALLS_PER_OVER) / legalBalls) : 0;
}

export function sumRuns(deliveries: Delivery[]): number {
  return deliveries.reduce((total, d) => total + d.total_runs, 0);
}

export function countLegal(deliveries: Delivery[]): number {
  return deliveries.filter((d) => d.is_legal).length;
}

export function countWickets(deliveries: Delivery[]): number {
  return deliveries.filter((d) => d.wicket).length;
}

export interface OverGroup {
  over: number;
  balls: Delivery[];
}

export function groupByOver(deliveries: Delivery[]): OverGroup[] {
  const groups: OverGroup[] = [];
  for (const delivery of deliveries) {
    const last = groups[groups.length - 1];
    if (last && last.over === delivery.over) {
      last.balls.push(delivery);
    } else {
      groups.push({ over: delivery.over, balls: [delivery] });
    }
  }
  return groups;
}

export function clampBallIndex(requested: number, total: number): number {
  if (!Number.isFinite(requested)) return 0;
  return Math.max(0, Math.min(total, Math.floor(requested)));
}

const inningsCache = new Map<string, DemoInnings>();

export function loadInnings(fixture: FixtureMatch): DemoInnings {
  const cached = inningsCache.get(fixture.match_id);
  if (cached) return cached;

  const deliveries = buildDeliveries(fixture);
  const innings: DemoInnings = {
    fixture,
    deliveries,
    target: fixture.first_innings.score + 1,
    legal_total: fixture.chase_overs.length * BALLS_PER_OVER,
    start_pair: [fixture.chase_batting_order[0], fixture.chase_batting_order[1]],
    batting_team: fixture.teams[1].name,
    bowling_team: fixture.teams[0].name,
  };
  inningsCache.set(fixture.match_id, innings);
  return innings;
}

function buildDeliveries(fixture: FixtureMatch): Delivery[] {
  const order = fixture.chase_batting_order;
  const deliveries: Delivery[] = [];
  let striker = order[0];
  let nonStriker = order[1];
  let nextBatter = 2;
  let wicketsFallen = 0;

  fixture.chase_overs.forEach((over, overIdx) => {
    const overNumber = overIdx + 1;
    let legalInOver = 0;

    for (const token of over.deliveries.split(/\s+/)) {
      const isLegal = token !== 'wd' && token !== 'nb';
      const ballNumber = legalInOver + 1;
      const batter = striker;
      const partner = nonStriker;
      let runsOffBat = 0;
      let extras = 0;
      let outcome: DeliveryOutcome = 'dot';
      let wicket: BallEvent['wicket'] = null;
      let commentary: string;
      let swapEnds = false;

      if (token === 'wd') {
        extras = 1;
        outcome = 'wide';
        commentary = `Wide from ${over.bowler}, one extra added and the ball is bowled again.`;
      } else if (token === 'nb') {
        extras = 1;
        outcome = 'no_ball';
        commentary = `No ball from ${over.bowler}, one extra added to the total.`;
      } else if (token === 'lb') {
        extras = 1;
        outcome = 'leg_bye';
        swapEnds = true;
        commentary = `Leg bye off ${over.bowler}, the batters run one.`;
      } else if (token === 'W') {
        const kind = WICKET_KINDS[wicketsFallen % WICKET_KINDS.length];
        wicket = { batter, kind };
        outcome = 'wicket';
        commentary = `OUT! ${batter} departs, ${kind} off ${over.bowler}.`;
        wicketsFallen += 1;
        striker = order[nextBatter] ?? '';
        nextBatter += 1;
      } else {
        runsOffBat = Number(token);
        if (runsOffBat === 4) {
          outcome = 'four';
          commentary = `FOUR. ${batter} finds the gap off ${over.bowler}.`;
        } else if (runsOffBat === 6) {
          outcome = 'six';
          commentary = `SIX. ${batter} clears the rope off ${over.bowler}.`;
        } else if (runsOffBat === 0) {
          outcome = 'dot';
          commentary = `${over.bowler} to ${batter}, no run.`;
        } else {
          outcome = 'run';
          commentary = `${batter} works it for ${runsOffBat}.`;
        }
        swapEnds = runsOffBat % 2 === 1;
      }

      if (swapEnds) {
        [striker, nonStriker] = [nonStriker, striker];
      }
      if (isLegal) {
        legalInOver += 1;
        if (legalInOver === BALLS_PER_OVER) {
          [striker, nonStriker] = [nonStriker, striker];
        }
      }

      deliveries.push({
        index: deliveries.length,
        over: overNumber,
        ball_in_over: ballNumber,
        over_label: `${overNumber}.${ballNumber}`,
        bowler: over.bowler,
        striker: batter,
        non_striker: partner,
        runs_off_bat: runsOffBat,
        extras,
        total_runs: runsOffBat + extras,
        is_legal: isLegal,
        outcome,
        wicket,
        commentary,
        pair_after: [striker, nonStriker],
      });
    }
  });

  return deliveries;
}

export function batterLine(name: string, deliveries: Delivery[], onStrike: boolean): BatterLine {
  let runs = 0;
  let balls = 0;
  let fours = 0;
  let sixes = 0;
  let isOut = false;

  for (const d of deliveries) {
    if (d.striker === name) {
      if (d.outcome !== 'wide') balls += 1;
      runs += d.runs_off_bat;
      if (d.outcome === 'four') fours += 1;
      if (d.outcome === 'six') sixes += 1;
    }
    if (d.wicket?.batter === name) isOut = true;
  }

  return {
    name,
    runs,
    balls,
    fours,
    sixes,
    strike_rate: balls > 0 ? round1((runs * 100) / balls) : 0,
    is_out: isOut,
    is_on_strike: onStrike,
  };
}

function bowlerLine(name: string, deliveries: Delivery[]): BowlerLine {
  let legal = 0;
  let runs = 0;
  let wickets = 0;

  for (const d of deliveries) {
    if (d.bowler !== name) continue;
    if (d.is_legal) legal += 1;
    runs += d.runs_off_bat + (d.outcome === 'leg_bye' ? 0 : d.extras);
    if (d.wicket && d.wicket.kind !== 'run out') wickets += 1;
  }

  return {
    name,
    overs: formatOvers(legal),
    runs,
    wickets,
    economy: legal > 0 ? round2((runs * BALLS_PER_OVER) / legal) : 0,
  };
}

export function currentPartnership(deliveries: Delivery[], pair: [string, string]): Partnership {
  let start = 0;
  for (let i = deliveries.length - 1; i >= 0; i -= 1) {
    if (deliveries[i].wicket) {
      start = i + 1;
      break;
    }
  }
  const since = deliveries.slice(start);
  return { runs: sumRuns(since), balls: countLegal(since), batters: pair };
}

export function getMatchState(inn: DemoInnings, requestedIndex: number): MatchState {
  const total = inn.deliveries.length;
  const idx = clampBallIndex(requestedIndex, total);
  const processed = inn.deliveries.slice(0, idx);
  const legal = countLegal(processed);
  const score = sumRuns(processed);
  const wickets = countWickets(processed);
  const pair: [string, string] = idx === 0 ? inn.start_pair : processed[idx - 1].pair_after;
  const upcoming = inn.deliveries[Math.min(idx, total - 1)];
  const remainingRuns = Math.max(inn.target - score, 0);
  const remainingBalls = inn.legal_total - legal;
  const chaseComplete = score >= inn.target;
  const result = resultAt(inn, score, wickets, legal);

  return {
    match_id: inn.fixture.match_id,
    ball_index: idx,
    total_deliveries: total,
    innings: 2,
    batting_team: inn.batting_team,
    bowling_team: inn.bowling_team,
    score,
    wickets,
    overs: formatOvers(legal),
    legal_balls: legal,
    current_run_rate: runRate(score, legal),
    required_run_rate:
      !chaseComplete && remainingBalls > 0 ? round2((remainingRuns * BALLS_PER_OVER) / remainingBalls) : null,
    target: inn.target,
    remaining_runs: remainingRuns,
    remaining_balls: remainingBalls,
    batting_pair: [
      batterLine(pair[0], processed, true),
      batterLine(pair[1], processed, false),
    ],
    current_bowler: bowlerLine(upcoming.bowler, processed),
    partnership: currentPartnership(processed, pair),
    recent_events: processed.slice(-6),
    last_ball: idx > 0 ? processed[idx - 1] : null,
    result,
  };
}

export function buildTimeline(inn: DemoInnings, ballIndex: number): MatchTimelineEntry[] {
  const processed = inn.deliveries.slice(0, clampBallIndex(ballIndex, inn.deliveries.length));
  let cumulativeRuns = 0;
  let cumulativeWickets = 0;
  let cumulativeLegal = 0;

  return groupByOver(processed).map((group) => {
    const runs = sumRuns(group.balls);
    const wickets = countWickets(group.balls);
    cumulativeRuns += runs;
    cumulativeWickets += wickets;
    cumulativeLegal += countLegal(group.balls);
    return {
      over: group.over,
      balls: group.balls,
      runs,
      wickets,
      cumulative_runs: cumulativeRuns,
      cumulative_wickets: cumulativeWickets,
      run_rate: runRate(cumulativeRuns, cumulativeLegal),
      target_pace: round1((inn.target * group.over) / OVERS_PER_INNINGS),
    };
  });
}

export function toMatch(inn: DemoInnings): Match {
  const { fixture } = inn;
  return {
    match_id: fixture.match_id,
    tournament: fixture.tournament,
    match_number: fixture.match_number,
    teams: fixture.teams,
    venue: fixture.venue,
    match_date: fixture.match_date,
    format: 'T20',
    status: 'completed',
    current_innings: 2,
    total_balls_per_innings: inn.legal_total,
    is_demo: true,
  };
}

function resultAt(inn: DemoInnings, score: number, wickets: number, legal: number): string | null {
  if (score >= inn.target) {
    return `${inn.batting_team} won by ${10 - wickets} wickets`;
  }
  if (legal >= inn.legal_total || wickets >= 10) {
    return `${inn.bowling_team} won by ${inn.target - 1 - score} runs`;
  }
  return null;
}
