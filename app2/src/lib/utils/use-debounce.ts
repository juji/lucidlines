// Simple debouncing utility for Svelte 5
export function useDebounce(delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function debounced<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    }) as T;
  };
}