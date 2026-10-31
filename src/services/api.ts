import type {
  CatchUpRequest,
  CatchUpResponse,
  ChatRequest,
  ChatResponse,
  Match,
  MatchState,
  MatchTimelineEntry,
  ReplayAdvanceResponse,
  StoryItem,
} from '../types/match';
import { DEMO_FIXTURES } from '../data/demo/fixtures';
import {
  buildTimeline,
  clampBallIndex,
  getMatchState as computeMatchState,
  loadInnings,
  toMatch,
  type DemoInnings,
} from './demo/matchEngine';
import { buildCatchUp, buildInsights, buildStories } from './demo/matchInsights';
import { answerQuestion } from './demo/demoAssistant';

export class ApiError extends Error {}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const DEMO_CHAT_LATENCY_MS = 700;
const DEMO_RECAP_LATENCY_MS = 900;

export const isDemoMode = DEMO_MODE;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function demoInnings(matchId: string): DemoInnings {
  const fixture = DEMO_FIXTURES.find((f) => f.match_id === matchId);
  if (!fixture) throw new ApiError(`No demo match exists with the id ${matchId}.`);
  return loadInnings(fixture);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('The MatchLens backend is not configured. Set VITE_API_BASE_URL or enable demo mode.');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    throw new ApiError(`The MatchLens service responded with status ${response.status}.`);
  }
  return (await response.json()) as T;
}

export async function getMatches(): Promise<Match[]> {
  if (DEMO_MODE) return DEMO_FIXTURES.map((f) => toMatch(loadInnings(f)));
  return request<Match[]>('/api/matches');
}

export async function getMatchState(matchId: string, ballIndex: number): Promise<MatchState> {
  if (DEMO_MODE) return computeMatchState(demoInnings(matchId), ballIndex);
  return request<MatchState>(`/api/matches/${encodeURIComponent(matchId)}/state?ball_index=${ballIndex}`);
}

export async function getBallTimeline(matchId: string, ballIndex: number): Promise<MatchTimelineEntry[]> {
  if (DEMO_MODE) return buildTimeline(demoInnings(matchId), ballIndex);
  return request<MatchTimelineEntry[]>(`/api/matches/${encodeURIComponent(matchId)}/timeline?ball_index=${ballIndex}`);
}

export async function getMatchInsights(matchId: string, ballIndex: number): Promise<string[]> {
  if (DEMO_MODE) return buildInsights(demoInnings(matchId), ballIndex);
  return request<string[]>(`/api/matches/${encodeURIComponent(matchId)}/insights?ball_index=${ballIndex}`);
}

export async function getMatchStories(matchId: string): Promise<StoryItem[]> {
  if (DEMO_MODE) return buildStories(demoInnings(matchId));
  return request<StoryItem[]>(`/api/matches/${encodeURIComponent(matchId)}/stories`);
}

export async function advanceReplay(matchId: string, fromIndex: number, steps: number): Promise<ReplayAdvanceResponse> {
  if (DEMO_MODE) {
    const innings = demoInnings(matchId);
    const total = innings.deliveries.length;
    return {
      match_id: matchId,
      ball_index: clampBallIndex(fromIndex + steps, total),
      total_deliveries: total,
    };
  }
  return request<ReplayAdvanceResponse>(`/api/matches/${encodeURIComponent(matchId)}/replay/advance`, {
    method: 'POST',
    body: JSON.stringify({ from_index: fromIndex, steps }),
  });
}

export async function askMatchLens(payload: ChatRequest): Promise<ChatResponse> {
  if (DEMO_MODE) {
    await wait(DEMO_CHAT_LATENCY_MS);
    return answerQuestion(demoInnings(payload.match_id), payload.question, payload.ball_index);
  }
  return request<ChatResponse>('/api/chat', { method: 'POST', body: JSON.stringify(payload) });
}

export async function generateCatchUp(payload: CatchUpRequest): Promise<CatchUpResponse> {
  if (DEMO_MODE) {
    await wait(DEMO_RECAP_LATENCY_MS);
    return buildCatchUp(demoInnings(payload.match_id), payload.ball_index, payload.overs);
  }
  return request<CatchUpResponse>(`/api/matches/${encodeURIComponent(payload.match_id)}/catch-up`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
