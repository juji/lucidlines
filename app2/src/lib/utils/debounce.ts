// Simple debounce utility for Svelte 5
export function createDebounce(delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function debounce<T extends (...args: any[]) => any>(fn: T): T {
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

// Hook-like debounce for reactive contexts
export function useDebounce<T>(value: T, delay: number): T {
  let debouncedValue = $state<T>(value);

  $effect(() => {
    const timeoutId = setTimeout(() => {
      debouncedValue = value;
    }, delay);

    return () => clearTimeout(timeoutId);
  });

  return debouncedValue;
}