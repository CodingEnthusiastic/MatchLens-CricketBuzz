from typing import Literal

from pydantic import BaseModel, Field


class TeamInfo(BaseModel):
    name: str
    code: str


class Wicket(BaseModel):
    batter: str
    kind: str


class BallEvent(BaseModel):
    index: int
    over: int
    ball_in_over: int
    over_label: str
    bowler: str
    striker: str
    non_striker: str
    runs_off_bat: int
    extras: int
    total_runs: int
    is_legal: bool
    outcome: str
    wicket: Wicket | None = None
    commentary: str


class Match(BaseModel):
    match_id: str
    tournament: str
    match_number: str
    teams: tuple[TeamInfo, TeamInfo]
    venue: str
    match_date: str
    format: Literal["T20"] = "T20"
    status: Literal["upcoming", "in_progress", "completed"] = "completed"
    current_innings: Literal[1, 2] = 2
    total_balls_per_innings: int = 120
    is_demo: bool = True


class BatterLine(BaseModel):
    name: str
    runs: int
    balls: int
    fours: int
    sixes: int
    strike_rate: float
    is_out: bool
    is_on_strike: bool


class BowlerLine(BaseModel):
    name: str
    overs: str
    runs: int
    wickets: int
    economy: float


class Partnership(BaseModel):
    runs: int
    balls: int
    batters: tuple[str, str]


class MatchState(BaseModel):
    match_id: str
    ball_index: int
    total_deliveries: int
    innings: Literal[1, 2]
    batting_team: str
    bowling_team: str
    score: int
    wickets: int
    overs: str
    legal_balls: int
    current_run_rate: float
    required_run_rate: float | None
    target: int | None
    remaining_runs: int | None
    remaining_balls: int | None
    batting_pair: tuple[BatterLine, BatterLine]
    current_bowler: BowlerLine
    partnership: Partnership
    recent_events: list[BallEvent]
    last_ball: BallEvent | None
    result: str | None


class TimelineEntry(BaseModel):
    over: int
    balls: list[BallEvent]
    runs: int
    wickets: int
    cumulative_runs: int
    cumulative_wickets: int
    run_rate: float
    target_pace: float | None


class ReplayAdvanceRequest(BaseModel):
    from_index: int = Field(ge=0)
    steps: int = Field(ge=-1000, le=1000)


class ChatRequest(BaseModel):
    match_id: str
    question: str = Field(min_length=1, max_length=2000)
    ball_index: int = Field(ge=0)
    conversation_id: str | None = None


class CatchUpRequest(BaseModel):
    match_id: str
    ball_index: int = Field(ge=0)
    overs: int = Field(default=3, ge=1, le=20)


class ComputedFact(BaseModel):
    label: str
    value: str


class EvidenceItem(BaseModel):
    kind: str
    title: str
    detail: str
    over_range: str | None = None
    ball_index: int | None = None


class Citation(BaseModel):
    title: str
    source: str
    excerpt: str
    url: str | None = None


class ChatResponse(BaseModel):
    answer: str
    intent: str
    computed_facts: list[ComputedFact]
    evidence: list[EvidenceItem]
    citations: list[Citation]
    confidence: str | None
    warnings: list[str]
    source: str = "backend"
    last_processed_ball_index: int
    match_id: str


class KeyMoment(BaseModel):
    title: str
    detail: str
    over_label: str
    tone: str


class CatchUpStatistic(BaseModel):
    label: str
    value: str


class CatchUpResponse(BaseModel):
    match_id: str
    from_over: str
    to_over: str
    headline: str
    summary: str
    key_moments: list[KeyMoment]
    important_events: list[BallEvent]
    statistics: list[CatchUpStatistic]
    key_players: list[BatterLine]
    evidence: list[EvidenceItem]
    source: str = "backend"
    last_processed_ball_index: int
