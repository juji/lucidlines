// Simple debouncing utility for Svelte 5 - no arguments
export function useDebounce(delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (fn: () => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(), delay);
  };
}