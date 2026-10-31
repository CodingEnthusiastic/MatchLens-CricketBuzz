import type { ChatResponse, ComputedFact, EvidenceItem } from '../../types/match';
import {
  countWickets,
  countLegal,
  formatOvers,
  getMatchState,
  groupByOver,
  round1,
  sumRuns,
  type Delivery,
  type DemoInnings,
} from './matchEngine';
import { lastOvers } from './matchInsights';

interface Answer {
  answer: string;
  intent: string;
  facts: ComputedFact[];
  evidence: EvidenceItem[];
  confidence: ChatResponse['confidence'];
  warnings: string[];
}

const DEMO_WARNING = 'Demo mode answers from this fixture only. No live feed or external cricket knowledge is connected.';

const ballEvidence = (d: Delivery): EvidenceItem => ({
  kind: 'ball',
  title: `${d.over_label} ${d.bowler} to ${d.striker}`,
  detail: d.commentary,
  ball_index: d.index + 1,
});

const overEvidence = (balls: Delivery[], over: number): EvidenceItem => {
  const last = balls[balls.length - 1];
  const runs = sumRuns(balls);
  return {
    kind: 'over',
    title: `Over ${over}`,
    detail: `${runs} runs, ${countWickets(balls)} wicket(s), bowled by ${balls[0].bowler}.`,
    over_range: `${balls[0].over_label} to ${last.over_label}`,
    ball_index: last.index + 1,
  };
};

function scoringRateAnswer(inn: DemoInnings, processed: Delivery[]): Answer {
  const groups = groupByOver(processed);
  const recent = groups.slice(-3).flatMap((g) => g.balls);
  const earlier = groups.slice(-6, -3).flatMap((g) => g.balls);
  const recentOvers = Math.min(groups.length, 3);
  const earlierOvers = Math.min(Math.max(groups.length - 3, 0), 3);
  const recentPerOver = recentOvers ? sumRuns(recent) / recentOvers : 0;
  const dots = recent.filter((d) => d.is_legal && d.runs_off_bat === 0 && !d.wicket).length;
  const wickets = countWickets(recent);
  const boundaries = recent.filter((d) => d.outcome === 'four' || d.outcome === 'six').length;

  const comparison =
    earlierOvers > 0
      ? `The last ${recentOvers} overs produced ${round1(recentPerOver)} runs an over, against ${round1(
          sumRuns(earlier) / earlierOvers
        )} in the ${earlierOvers} overs before.`
      : `The last ${recentOvers} overs produced ${round1(recentPerOver)} runs an over.`;

  const drivers: string[] = [];
  if (dots > 0) drivers.push(`- ${dots} dot ball${dots === 1 ? '' : 's'} in that spell`);
  if (wickets > 0) drivers.push(`- ${wickets} wicket${wickets === 1 ? '' : 's'} fell`);
  drivers.push(`- ${boundaries} boundar${boundaries === 1 ? 'y' : 'ies'} scored`);

  return {
    answer: `${comparison}\n\nThe main drivers were:\n${drivers.join('\n')}`,
    intent: 'scoring_rate',
    facts: [
      { label: 'Current run rate', value: getMatchState(inn, processed.length).current_run_rate.toFixed(2) },
      { label: 'Last 3 overs', value: `${round1(recentPerOver)} runs an over` },
      { label: 'Dot balls (last 3 overs)', value: String(dots) },
      { label: 'Wickets (last 3 overs)', value: String(wickets) },
    ],
    evidence: groups.slice(-3).map((g) => overEvidence(g.balls, g.over)),
    confidence: 'high',
    warnings: [],
  };
}

function recentOversAnswer(processed: Delivery[]): Answer {
  const window = lastOvers(processed, 3);
  if (window.length === 0) {
    return {
      answer: 'The replay has not started yet, so there are no overs to summarise.',
      intent: 'recent_overs',
      facts: [],
      evidence: [],
      confidence: null,
      warnings: [],
    };
  }

  const balls = window.flatMap((g) => g.balls);
  const lines = window.map((g) => {
    const wickets = countWickets(g.balls);
    const runs = sumRuns(g.balls);
    return `- **Over ${g.over}** (${g.balls[0].bowler}): ${runs} run${runs === 1 ? '' : 's'}${
      wickets ? `, ${wickets} wicket${wickets === 1 ? '' : 's'}` : ''
    }`;
  });

  const wicketBalls = balls.filter((d) => d.wicket);
  const wicketLines = wicketBalls.map((d) => `- ${d.over_label}: ${d.wicket?.batter} out, ${d.wicket?.kind} off ${d.bowler}`);

  return {
    answer:
      `Across the last ${window.length} overs, ${sumRuns(balls)} runs were scored for ${countWickets(balls)} wicket(s).\n\n` +
      `${lines.join('\n')}` +
      (wicketLines.length ? `\n\n**Wickets**\n${wicketLines.join('\n')}` : ''),
    intent: 'recent_overs',
    facts: [
      { label: 'Runs', value: String(sumRuns(balls)) },
      { label: 'Wickets', value: String(countWickets(balls)) },
      { label: 'Legal balls', value: formatOvers(countLegal(balls)) },
    ],
    evidence: [
      ...window.map((g) => overEvidence(g.balls, g.over)),
      ...wicketBalls.map(ballEvidence),
    ],
    confidence: 'high',
    warnings: [],
  };
}

function partnershipAnswer(inn: DemoInnings, ballIndex: number): Answer {
  const state = getMatchState(inn, ballIndex);
  const [onStrike, offStrike] = state.batting_pair;
  const partnership = state.partnership;
  const leader =
    onStrike.strike_rate === offStrike.strike_rate
      ? null
      : onStrike.strike_rate > offStrike.strike_rate
        ? onStrike
        : offStrike;

  const control = leader
    ? `**${leader.name}** is currently scoring faster, at a strike rate of ${leader.strike_rate}, so the stronger hand is ${leader.name}.`
    : 'Both batters are scoring at the same strike rate, so neither has clear control.';

  return {
    answer:
      `${onStrike.name} and ${offStrike.name} have added **${partnership.runs} runs** from ${partnership.balls} balls in this partnership.\n\n` +
      `- **${onStrike.name}** (on strike): ${onStrike.runs} off ${onStrike.balls}, strike rate ${onStrike.strike_rate}\n` +
      `- **${offStrike.name}**: ${offStrike.runs} off ${offStrike.balls}, strike rate ${offStrike.strike_rate}\n\n` +
      control,
    intent: 'partnership_control',
    facts: [
      { label: 'Partnership', value: `${partnership.runs} off ${partnership.balls}` },
      { label: `${onStrike.name} strike rate`, value: onStrike.strike_rate.toFixed(1) },
      { label: `${offStrike.name} strike rate`, value: offStrike.strike_rate.toFixed(1) },
    ],
    evidence: [
      {
        kind: 'statistic',
        title: 'Partnership since last wicket',
        detail: `${partnership.runs} runs from ${partnership.balls} legal balls at the replay position.`,
        ball_index: state.ball_index,
      },
    ],
    confidence: 'high',
    warnings: [],
  };
}

function requiredRateAnswer(inn: DemoInnings, ballIndex: number): Answer {
  const state = getMatchState(inn, ballIndex);
  const facts: ComputedFact[] = [
    { label: 'Target', value: String(state.target) },
    { label: 'Runs needed', value: String(state.remaining_runs) },
    { label: 'Balls remaining', value: String(state.remaining_balls) },
    { label: 'Current run rate', value: state.current_run_rate.toFixed(2) },
  ];

  if (state.required_run_rate === null) {
    return {
      answer: `The chase is over at this point, so there is no required rate left to track. The result is **${state.score >= (state.target ?? 0) ? 'a win for the chasing side' : 'a win for the defending side'}**.`,
      intent: 'required_run_rate',
      facts,
      evidence: [],
      confidence: 'high',
      warnings: [],
    };
  }

  const gap = round1(state.required_run_rate - state.current_run_rate);
  return {
    answer:
      `${state.batting_team} need **${state.remaining_runs} runs from ${state.remaining_balls} balls**.\n\n` +
      `The required run rate is **${state.required_run_rate}** an over. The current run rate is ${state.current_run_rate}, so the gap is ${gap >= 0 ? gap : 0}.\n\n` +
      `Required run rate is the runs still needed multiplied by 6, divided by the balls remaining.`,
    intent: 'required_run_rate',
    facts,
    evidence: [
      {
        kind: 'statistic',
        title: 'Required run rate',
        detail: `${state.remaining_runs} x 6 / ${state.remaining_balls} = ${state.required_run_rate}`,
        ball_index: state.ball_index,
      },
    ],
    confidence: 'high',
    warnings: [],
  };
}

function umpireAnswer(processed: Delivery[]): Answer {
  const lastWicket = [...processed].reverse().find((d) => d.wicket);
  const lastLine = lastWicket?.wicket
    ? `The most recent dismissal in the replay was ${lastWicket.wicket.batter}, ${lastWicket.wicket.kind} off ${lastWicket.bowler} at ${lastWicket.over_label}.`
    : 'No wickets have fallen in the replay so far.';

  return {
    answer:
      'This replay records what happened on every delivery, but not the umpire\'s decision, any review, or the reasoning behind it. ' +
      `I cannot tell from this data whether the decision was correct.\n\n${lastLine}`,
    intent: 'umpiring_decision',
    facts: [],
    evidence: lastWicket ? [ballEvidence(lastWicket)] : [],
    confidence: 'low',
    warnings: ['Umpire decisions and review footage are not part of the demo data.'],
  };
}

function fallbackAnswer(): Answer {
  return {
    answer:
      'I can answer questions about the scoring rate, the last three overs, the current partnership, the required run rate, and what an umpiring decision means for the match. Try one of the suggested questions.',
    intent: 'unsupported',
    facts: [],
    evidence: [],
    confidence: null,
    warnings: [],
  };
}

function classify(question: string): (inn: DemoInnings, ballIndex: number, processed: Delivery[]) => Answer {
  const q = question.toLowerCase();
  if (/umpir|decision|review|drs|lbw|referr/.test(q)) return (_inn, _i, processed) => umpireAnswer(processed);
  if (/required|rrr|need|chase/.test(q)) return (inn, i) => requiredRateAnswer(inn, i);
  if (/partnership|control|batter|batsm|pair|strike/.test(q)) return (inn, i) => partnershipAnswer(inn, i);
  if (/last (three|3)|recent|happened|miss|over/.test(q)) return (_inn, _i, processed) => recentOversAnswer(processed);
  if (/rate|slow|drop|scoring|momentum|pace/.test(q)) return (inn, _i, processed) => scoringRateAnswer(inn, processed);
  return () => fallbackAnswer();
}

export function answerQuestion(inn: DemoInnings, question: string, ballIndex: number): ChatResponse {
  const state = getMatchState(inn, ballIndex);
  const processed = inn.deliveries.slice(0, state.ball_index);
  const answer = classify(question)(inn, state.ball_index, processed);

  return {
    answer: answer.answer,
    intent: answer.intent,
    computed_facts: answer.facts,
    evidence: answer.evidence,
    citations: [],
    confidence: answer.confidence,
    warnings: [...answer.warnings, DEMO_WARNING],
    source: 'demo',
    last_processed_ball_index: state.ball_index,
    match_id: inn.fixture.match_id,
  };
}
