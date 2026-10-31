export type MatchStatus = 'upcoming' | 'in_progress' | 'completed';

export type InningsNumber = 1 | 2;

export interface TeamInfo {
  name: string;
  code: string;
}

export interface Match {
  match_id: string;
  tournament: string;
  match_number: string;
  teams: [TeamInfo, TeamInfo];
  venue: string;
  match_date: string;
  format: 'T20';
  status: MatchStatus;
  current_innings: InningsNumber;
  total_balls_per_innings: number;
  is_demo: boolean;
}

export type DeliveryOutcome =
  | 'dot'
  | 'run'
  | 'four'
  | 'six'
  | 'wicket'
  | 'wide'
  | 'no_ball'
  | 'leg_bye';

export interface BallEvent {
  index: number;
  over: number;
  ball_in_over: number;
  over_label: string;
  bowler: string;
  striker: string;
  non_striker: string;
  runs_off_bat: number;
  extras: number;
  total_runs: number;
  is_legal: boolean;
  outcome: DeliveryOutcome;
  wicket: { batter: string; kind: string } | null;
  commentary: string;
}

export interface BatterLine {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  is_out: boolean;
  is_on_strike: boolean;
}

export interface BowlerLine {
  name: string;
  overs: string;
  runs: number;
  wickets: number;
  economy: number;
}

export interface Partnership {
  runs: number;
  balls: number;
  batters: [string, string];
}

export interface MatchState {
  match_id: string;
  ball_index: number;
  total_deliveries: number;
  innings: InningsNumber;
  batting_team: string;
  bowling_team: string;
  score: number;
  wickets: number;
  overs: string;
  legal_balls: number;
  current_run_rate: number;
  required_run_rate: number | null;
  target: number | null;
  remaining_runs: number | null;
  remaining_balls: number | null;
  batting_pair: [BatterLine, BatterLine];
  current_bowler: BowlerLine;
  partnership: Partnership;
  recent_events: BallEvent[];
  last_ball: BallEvent | null;
  result: string | null;
}

export interface MatchTimelineEntry {
  over: number;
  balls: BallEvent[];
  runs: number;
  wickets: number;
  cumulative_runs: number;
  cumulative_wickets: number;
  run_rate: number;
  target_pace: number | null;
}

export interface ChatRequest {
  match_id: string;
  question: string;
  ball_index: number;
  conversation_id: string | null;
}

export interface ComputedFact {
  label: string;
  value: string;
}

export interface EvidenceItem {
  kind: 'ball' | 'over' | 'statistic' | 'rule';
  title: string;
  detail: string;
  over_range?: string;
  ball_index?: number;
}

export interface Citation {
  title: string;
  source: string;
  excerpt: string;
  url?: string;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  computed_facts: ComputedFact[];
  evidence: EvidenceItem[];
  citations: Citation[];
  confidence: 'high' | 'medium' | 'low' | null;
  warnings: string[];
  source: 'backend' | 'demo';
  last_processed_ball_index: number;
  match_id: string;
}

export interface CatchUpRequest {
  match_id: string;
  ball_index: number;
  overs: number;
}

export interface KeyMoment {
  title: string;
  detail: string;
  over_label: string;
  tone: 'wicket' | 'boundary' | 'pressure' | 'neutral';
}

export interface CatchUpStatistic {
  label: string;
  value: string;
}

export interface CatchUpResponse {
  match_id: string;
  from_over: string;
  to_over: string;
  headline: string;
  summary: string;
  key_moments: KeyMoment[];
  important_events: BallEvent[];
  statistics: CatchUpStatistic[];
  key_players: BatterLine[];
  evidence: EvidenceItem[];
  source: 'backend' | 'demo';
  last_processed_ball_index: number;
}

export interface StoryItem {
  kind: 'momentum' | 'wicket' | 'partnership' | 'over';
  title: string;
  detail: string;
  over_label: string;
  ball_index: number;
}

export interface ReplayAdvanceResponse {
  match_id: string;
  ball_index: number;
  total_deliveries: number;
}
