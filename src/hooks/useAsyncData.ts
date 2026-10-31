import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function useAsyncData<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, error: null, loading: true }));
    load()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (active) setState((prev) => ({ data: prev.data, error: errorMessage(error), loading: false }));
      });
    return () => {
      active = false;
    };
    // The caller controls when the load re-runs through deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
