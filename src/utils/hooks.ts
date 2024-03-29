import { useRef, useLayoutEffect, useEffect } from 'react';

export const useLatestCallback = <Callback extends (...args: never) => void>(cb: Callback): Callback => {
  const cbRef = useRef(cb);
  useLayoutEffect(() => {
    cbRef.current = cb;
  });
  return useRef(((...args) => {
    return cbRef.current(...(args as never));
  }) as Callback).current;
};

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useLatestCallback(callback);

  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }

    const timerId = setInterval(() => {
      savedCallback();
    }, delay);

    return () => clearInterval(timerId);
  }, [delay, savedCallback]);
}

export const useOnUnmount = (fn: () => void) => {
  const latestFn = useLatestCallback(fn);
  useEffect(() => {
    return () => latestFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
