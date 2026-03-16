'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, ApiError } from '@/lib/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
}

/**
 * Generic hook for API calls with loading and error states
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate ?? true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetcher();
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, [fetcher]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    ...state,
    refetch,
    execute,
  };
}

/**
 * Hook for mutations (POST, PATCH, DELETE)
 */
export function useMutation<T, P = void>(
  mutator: (params: P) => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (params: P) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await mutator(params);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setState((prev) => ({ ...prev, loading: false, error: message }));
        throw err;
      }
    },
    [mutator]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
