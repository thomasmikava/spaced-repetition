import { useRef, useLayoutEffect } from 'react';

export const useLatestCallback = <Callback extends (...args: never) => void>(cb: Callback): Callback => {
  const cbRef = useRef(cb);
  useLayoutEffect(() => {
    cbRef.current = cb;
  });
  return useRef(((...args) => {
    return cbRef.current(...(args as never));
  }) as Callback).current;
};
