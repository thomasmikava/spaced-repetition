import type { Mutation, MutationObserverResult } from '@tanstack/react-query';
import { QueryClient, useIsMutating, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export { useMutation, useQueries, useQuery, useQueryClient };

export function useLastMutationState<
  Func extends (arg: never) => Promise<unknown>,
  TError = unknown,
  TContext = unknown,
>(
  key: readonly unknown[],
  func: Func,
): Func extends (args: infer TVariables) => Promise<infer TData>
  ? MutationObserverResult<TData, TError, TVariables, TContext>
  : never;
export function useLastMutationState<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  key: readonly unknown[],
): MutationObserverResult<TData, TError, TVariables, TContext>;
export function useLastMutationState<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  key: readonly unknown[],
): MutationObserverResult<TData, TError, TVariables, TContext> {
  const mutating = useIsMutating({ mutationKey: key });

  const queryClient = useQueryClient();

  const getLatestResult = useCallback(() => {
    const results = queryClient.getMutationCache().findAll({ mutationKey: key });
    return results[results.length - 1]?.state as MutationState<TData, TError, TVariables, TContext> | undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, ...key]);

  const [state, setState] = useState(getLatestResult);

  useEffect(() => {
    setState(getLatestResult());
  }, [mutating, getLatestResult]);

  useEffect(() => {
    const serializedKey = JSON.stringify(key);
    return queryClient.getMutationCache().subscribe((listener) => {
      if (listener.type === 'removed' && JSON.stringify(listener.mutation.options.mutationKey) === serializedKey) {
        setState(getLatestResult());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, ...key]);

  return useMemo(() => stateToResult(state), [state]);
}

export function useClearMutations(key: readonly unknown[]) {
  const queryClient = useQueryClient();

  const destroyAll = useCallback(() => {
    const cache = queryClient.getMutationCache();
    const results = cache.findAll({ mutationKey: key });
    results.forEach((result) => cache.remove(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, ...key]);

  return { destroyAll };
}

export function useSettledMutationsAutoDestroyer(key: readonly unknown[], delay = 1) {
  const queryClient = useQueryClient();
  const mutating = useIsMutating({ mutationKey: key });
  const { destroyAll } = useClearMutations(key);

  useEffect(() => {
    const results = queryClient.getMutationCache().findAll({ mutationKey: key });
    if (results.some((result) => result.state.status === 'success')) {
      setTimeout(() => {
        destroyAll();
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutating, destroyAll, queryClient, delay, ...key]);
}

export const createMutationSuccessAutoDestroyer = (...args: Parameters<typeof useSettledMutationsAutoDestroyer>) => {
  return () => useSettledMutationsAutoDestroyer(...args);
};

type MutationState<TData, TError, TVariables, TContext> = Mutation<TData, TError, TVariables, TContext>['state'];

const stateToResult = <TData, TError, TVariables, TContext>(
  state: MutationState<TData, TError, TVariables, TContext> | undefined,
) => {
  const finalState = state ?? getDefaultState();

  return {
    ...finalState,
    isPending: finalState.status === 'pending',
    isSuccess: finalState.status === 'success',
    isError: finalState.status === 'error',
    isIdle: finalState.status === 'idle',
  } as MutationObserverResult<TData, TError, TVariables, TContext>;
};

function getDefaultState<TData, TError, TVariables, TContext>(): MutationState<TData, TError, TVariables, TContext> {
  return {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: 'idle',
    variables: undefined,
    submittedAt: 0,
  };
}
