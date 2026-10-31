import { useCallback, useRef, useState } from 'react';
import { askMatchLens, generateCatchUp } from '../services/api';
import type { CatchUpResponse, ChatResponse } from '../types/match';
import { errorMessage } from './useAsyncData';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text?: string;
  response?: ChatResponse;
  error?: string;
  question?: string;
}

export function useAskMatchLens(matchId: string, ballIndex: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || pending) return;

      const userId = nextId.current++;
      const assistantId = nextId.current++;
      setMessages((prev) => [...prev, { id: userId, role: 'user', text: trimmed }]);
      setPending(true);

      try {
        const response = await askMatchLens({
          match_id: matchId,
          question: trimmed,
          ball_index: ballIndex,
          conversation_id: null,
        });
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', response, question: trimmed }]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', error: errorMessage(err), question: trimmed },
        ]);
      } finally {
        setPending(false);
      }
    },
    [matchId, ballIndex, pending]
  );

  return { messages, pending, send };
}

export type RecapStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useCatchUp(matchId: string, ballIndex: number, overs: number) {
  const [status, setStatus] = useState<RecapStatus>('idle');
  const [recap, setRecap] = useState<CatchUpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await generateCatchUp({ match_id: matchId, ball_index: ballIndex, overs });
      setRecap(response);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('error');
    }
  }, [matchId, ballIndex, overs]);

  const reset = useCallback(() => {
    setRecap(null);
    setStatus('idle');
    setError(null);
  }, []);

  return { status, recap, error, generate, reset };
}
