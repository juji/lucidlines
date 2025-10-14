<script lang="ts">
  import { AnsiUp } from 'ansi_up';
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import { terminalStore } from '$lib/stores/terminal-store.svelte';
  import { websocketStore } from '$lib/stores/websocket-store.svelte';
  import { useDebounce } from '$lib/utils/use-debounce';

  interface TerminalProps {
    logType: string;
    log?: boolean;
    title: string;
    onClose?: () => void;
  }

  let { logType, log, title, onClose }: TerminalProps = $props();

  let containerRef = $state<HTMLDivElement>();
  let virtualListEl = $state<HTMLDivElement>();
  let isAutoScrollEnabled = $state(true);
  let requestingHistory = $state(false);

  // Get logs and process into lines
  let lines = $derived(() => {
    const logs = terminalStore.logs[logType] || [];
    if (!logs.length) return [];

    const parser = new AnsiUp();
    parser.use_classes = true;

    const result = [];
    for (const log of logs) {
      const raw = (log.data ?? '').toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const rawLines = raw.split('\n');

      for (const line of rawLines) {
        const html = parser.ansi_to_html(line);
        result.push(html === '' ? '&nbsp;' : html);
      }
    }
    return result;
  });

  // Virtualizer setup - reactive to lines changes
  let virtualizer = createVirtualizer({
    count: 0, // Will be updated in effect
    getScrollElement: () => virtualListEl ?? null,
    estimateSize: () => 18,
    overscan: 5,
  });

  // Update virtualizer when lines change
  $effect(() => {
    $virtualizer.setOptions({
      count: lines().length,
      getScrollElement: () => virtualListEl ?? null,
      estimateSize: () => 18,
      overscan: 5,
    });
  });

  let items = $derived($virtualizer.getVirtualItems());

  // Auto-scroll to bottom when new lines arrive
  let prevLength = $state(0);
  $effect(() => {
    const currentLength = lines().length;
    if (currentLength > prevLength && isAutoScrollEnabled) {
      $virtualizer.scrollToIndex(currentLength - 1, { align: 'end' });
    }
    prevLength = currentLength;
  });

  // Handle history loading
  let debouncedHistoryRequest = useDebounce(300);

  function handleScroll() {
    if (!virtualListEl) return;

    // Check if at bottom
    const lastItem = items[items.length - 1];
    isAutoScrollEnabled = lastItem && lastItem.index === lines().length - 1;

    // Request history when near top
    if (!isAutoScrollEnabled && items.length > 0) {
      const firstItem = items[0];
      if (firstItem.index < lines().length * 0.5 && !requestingHistory) {
        requestingHistory = true;
        const logs = terminalStore.logs[logType] || [];
        const oldestLog = logs[0];
        if (oldestLog) {
          debouncedHistoryRequest(() => {
            websocketStore.requestHistory(logType, oldestLog.timestamp);
            requestingHistory = false;
          });
        }
      }
    }
  }

  // Reset history flag when logs update
  $effect(() => {
    if (requestingHistory && lines().length > 0) {
      requestingHistory = false;
    }
  });

  // devtools hook
  if (log) {
    /* no-op */
  }
</script>

<div class="terminal-container">
  <div class="terminal-header">
    <h3>{title}</h3>
    <div class="terminal-controls">
      <button
        class="auto-scroll-button {isAutoScrollEnabled ? 'active' : ''}"
        onclick={() => {
          isAutoScrollEnabled = true;
          $virtualizer.scrollToIndex(lines().length - 1, { align: 'end' });
        }}
        title={isAutoScrollEnabled ? 'Auto-scroll enabled' : 'Click to enable auto-scroll'}
      >
        ↓
      </button>
      {#if onClose}
        <button class="close-button" onclick={onClose}>
          ×
        </button>
      {/if}
    </div>
  </div>
  <div class="terminal-viewer">
    {#if lines().length === 0}
      <div class="terminal-empty">Waiting for output…</div>
    {:else}
      <div
        class="terminal-list scroll-container"
        bind:this={virtualListEl}
        onscroll={handleScroll}
      >
        <div
          style="position: relative; height: {$virtualizer.getTotalSize()}px; width: 100%;"
        >
          <div
            style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({items[0]?.start ?? 0}px);"
          >
            {#each items as row (row.index)}
              <div class="terminal-row">
                {@html lines()[row.index]}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .terminal-container {
    width: 100%;
    flex: 1;
    background-color: #1a1a1a;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    border: 1px solid #2e2e2e;
  }

  /* Terminal header with title and close button */
  .terminal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1f1f1f;
    padding: 4px 10px;
  }

  .terminal-header h3 {
    margin: 0;
    font-size: 14px;
    color: #f0f0f0;
  }

  .close-button {
    background: none;
    border: none;
    color: #888888;
    font-size: 18px;
    cursor: pointer;
    padding: 0 5px;
    outline: none;
  }

  .close-button:focus {
    outline: none;
  }

  .terminal-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .auto-scroll-button {
    background: none;
    border: 1px solid #555555;
    color: #888888;
    font-size: 14px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    outline: none;
    transition: all 0.2s ease;
  }

  .auto-scroll-button:hover {
    border-color: #777777;
    color: #aaaaaa;
  }

  .auto-scroll-button.active {
    background-color: #2b83ff;
    border-color: #2b83ff;
    color: #ffffff;
  }

  .auto-scroll-button:focus {
    outline: none;
  }

  .terminal-viewer {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    overflow: hidden;
    background: var(--terminal-bg, #111111);
    color: var(--terminal-fg, #d6d6d6);
    font-family: monospace;
    font-size: var(--terminal-font-size, 14px);
    line-height: 1.2;
    padding: 0;
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .terminal-list {
    flex: 1;
  }

  .terminal-row {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .terminal-empty {
    padding: 0.75rem;
    color: #6e6e6e;
    font-size: 0.85rem;
  }

  :global(.ansi-black-fg) { color: hsl(from rgb(42 42 42) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-red-fg) { color: hsl(from rgb(255 85 85) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-green-fg) { color: hsl(from rgb(85 255 85) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-yellow-fg) { color: hsl(from rgb(255 255 85) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-blue-fg) { color: hsl(from rgb(85 85 255) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-magenta-fg) { color: hsl(from rgb(255 85 255) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-cyan-fg) { color: hsl(from rgb(85 255 255) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-white-fg) { color: hsl(from rgb(200 200 200) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }

  :global(.ansi-bright-black-fg) { color: hsl(from rgb(112 112 112) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-red-fg) { color: hsl(from rgb(255 136 136) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-green-fg) { color: hsl(from rgb(136 255 136) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-yellow-fg) { color: hsl(from rgb(255 255 136) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-blue-fg) { color: hsl(from rgb(136 136 255) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-magenta-fg) { color: hsl(from rgb(255 136 255) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-cyan-fg) { color: hsl(from rgb(136 255 255) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-white-fg) { color: hsl(from rgb(220 220 220) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }

  :global(.ansi-black-bg) { background-color: hsl(from rgb(34 34 34) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-red-bg) { background-color: hsl(from rgb(51 0 0) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-green-bg) { background-color: hsl(from rgb(0 51 0) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-yellow-bg) { background-color: hsl(from rgb(51 51 0) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-blue-bg) { background-color: hsl(from rgb(0 0 51) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-magenta-bg) { background-color: hsl(from rgb(51 0 51) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-cyan-bg) { background-color: hsl(from rgb(0 51 51) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-white-bg) { background-color: hsl(from rgb(200 200 200) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }

  :global(.ansi-bright-black-bg) { background-color: hsl(from rgb(112 112 112) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-red-bg) { background-color: hsl(from rgb(85 17 17) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-green-bg) { background-color: hsl(from rgb(17 85 17) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-yellow-bg) { background-color: hsl(from rgb(85 85 17) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-blue-bg) { background-color: hsl(from rgb(17 17 85) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-magenta-bg) { background-color: hsl(from rgb(85 17 85) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-cyan-bg) { background-color: hsl(from rgb(17 85 85) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
  :global(.ansi-bright-white-bg) { background-color: hsl(from rgb(220 220 220) calc(h * var(--terminal-hue, 1)) calc(s * var(--terminal-saturation, 1)) calc(l * var(--terminal-lightness, 1))); }
</style>