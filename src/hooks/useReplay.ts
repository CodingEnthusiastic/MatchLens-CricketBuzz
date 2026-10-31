import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceReplay } from '../services/api';
import { errorMessage } from './useAsyncData';

export const REPLAY_SPEEDS = [1, 2, 4] as const;
export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number];

const BASE_TICK_MS = 1400;

export function useReplay(matchId: string, totalDeliveries: number, initialIndex: number) {
  const [index, setIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);
  const [error, setError] = useState<string | null>(null);
  const indexRef = useRef(index);

  const advanceBy = useCallback(
    async (steps: number) => {
      try {
        setError(null);
        const response = await advanceReplay(matchId, indexRef.current, steps);
        indexRef.current = response.ball_index;
        setIndex(response.ball_index);
      } catch (err) {
        setError(errorMessage(err));
        setIsPlaying(false);
      }
    },
    [matchId]
  );

  const seek = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(totalDeliveries, target));
      void advanceBy(clamped - indexRef.current);
    },
    [advanceBy, totalDeliveries]
  );

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      if (indexRef.current >= totalDeliveries) {
        setIsPlaying(false);
        return;
      }
      void advanceBy(1);
    }, BASE_TICK_MS / speed);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, advanceBy, totalDeliveries]);

  return {
    index,
    isPlaying,
    speed,
    error,
    atStart: index <= 0,
    atEnd: index >= totalDeliveries,
    setSpeed,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () => advanceBy(1),
    previous: () => advanceBy(-1),
    seek,
  };
}
