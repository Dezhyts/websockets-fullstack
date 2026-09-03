import { useCallback, useEffect, useRef } from 'react';

export function useThrottleCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
) {
  const isThrottledRef = useRef(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (isThrottledRef.current) return;

      isThrottledRef.current = true;
      callbackRef.current(...args);

      setTimeout(() => {
        isThrottledRef.current = false;
      }, delay);
    },
    [delay],
  );
}
