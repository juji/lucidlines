<script lang="ts">
  import { AnsiUp } from 'ansi_up';
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import { terminalStore } from '$lib/stores/terminal-store.svelte';
  import { websocketStore } from '$lib/stores/websocket-store.svelte';
  import { useDebounce } from '$lib/utils/use-debounce';
  import { tick } from 'svelte';
  import type { VirtualItem } from '@tanstack/svelte-virtual';

  interface TerminalProps {
    logType: string;
    log?: boolean;
    title: string;
    onClose?: () => void;
  }

  let { logType, log, title, onClose }: TerminalProps = $props();

  let containerRef = $state<HTMLDivElement>();
  let virtualListEl = $state<HTMLDivElement>();
  let virtualItemEls = $state<HTMLDivElement[]>([]);
  let isAutoScrollEnabled = $state(true);
  let viewportHeight = $state(300);
  let isResizing = $state(false);

  // Get logs and process into items
  let logs = $derived(terminalStore.logs[logType] || []);
  let items = $state<Array<{ html: string; lineCount: number; }>>([]);
  $effect(() => {
    if (!logs.length) {
      items = [];
      return;
    }
    const parser = new AnsiUp();
    parser.use_classes = true;
    const result: Array<{ html: string; lineCount: number; }> = [];
    for (const log of logs) {
      const raw = (log.data ?? '').toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = raw.split('\n');
      const lineCount = Math.max(1, lines.length - (lines[lines.length - 1] === '' ? 1 : 0));
      const html = parser.ansi_to_html(raw);
      result.push({
        html: html === '' ? '&nbsp;' : html,
        lineCount,
      });
    }
    items = result;
  });

  // Virtualizer setup - reactive to items changes
  let virtualizer = $state(createVirtualizer({
    count: 0,
    getScrollElement: () => virtualListEl ?? null,
    estimateSize: () => 20,
    overscan: 5,
    measureElement: (el) => el.getBoundingClientRect().height,
  }));

  let virtualItems = $state<VirtualItem[]>([]);

  $effect(() => {
    $virtualizer.setOptions({
      count: items.length,
      getScrollElement: () => virtualListEl ?? null,
      estimateSize: () => 20,
      overscan: 5,
      measureElement: (el) => el.getBoundingClientRect().height,
    });
    virtualItems = $virtualizer.getVirtualItems();
  });

  // Measure elements when they change
  $effect(() => {
    if (virtualItemEls.length) {
      virtualItemEls.forEach((el) => $virtualizer.measureElement(el));
    }
  });

  
  // Auto-scroll to bottom when new items arrive
  let prevLength = 0;
  let requestingHistory = false;
  
  $effect(() => {
    const currentLength = items.length;
    requestingHistory = false;
    tick().then(() => {
      if (currentLength > prevLength && isAutoScrollEnabled) {
        $virtualizer.scrollToOffset($virtualizer.getTotalSize() + 9999);
      }
      prevLength = currentLength;
    });
  });

  // Handle history loading
  let debouncedAutoScrollActivation = useDebounce(500);
  let lastScrollTop = -1;
  
  function requestHistory() {
    if (requestingHistory) return;
    requestingHistory = true;
    const logs = terminalStore.logs[logType] || [];
    const oldestLog = logs[0];
    if (oldestLog) {
      websocketStore.requestHistory(logType, oldestLog.timestamp);
    }
  }
  
  function handleScroll() {
    if (!virtualListEl || isResizing) return;
    const { scrollTop, scrollHeight, clientHeight } = virtualListEl;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;
    
    // this needs to happen immediately on scroll
    isAutoScrollEnabled = false;

    // Re-enable auto-scroll if scrolled back to bottom
    debouncedAutoScrollActivation(() => {
      console.log('Re-enabling auto-scroll');
      if (isAtBottom) {
        isAutoScrollEnabled = true;
        terminalStore.setRetainHistory(logType, false);
      }else{
        terminalStore.setRetainHistory(logType, true);
      }
    });

    lastScrollTop = scrollTop;
  }
  // Resize observer logic
  $effect(() => {
    if (!containerRef) return;
    function updateDimensions() {
      isResizing = true;
      viewportHeight = Math.max(1, containerRef?.clientHeight ?? 300);
      if (isAutoScrollEnabled) {
        $virtualizer.scrollToOffset($virtualizer.getTotalSize() + 9999);
      }
      setTimeout(() => {
        isResizing = false;
      }, 500);
    }
    updateDimensions();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef);
    return () => observer.disconnect();
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
        class="history-button"
        onclick={requestHistory}
        title="Load older logs"
      >
        history
      </button>
      <button
        class="auto-scroll-button {isAutoScrollEnabled ? 'active' : ''}"
        onclick={() => {
          isAutoScrollEnabled = true;
          $virtualizer.scrollToOffset($virtualizer.getTotalSize());
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
  <div class="terminal-viewer" bind:this={containerRef}>
    {#if items.length === 0}
      <div class="terminal-empty">Waiting for output…</div>
    {:else}
      <div
        class="terminal-list scroll-container"
        bind:this={virtualListEl}
        onscroll={handleScroll}
        style="height: {viewportHeight}px"
      >
        <div
          style="position: relative; height: {$virtualizer.getTotalSize()}px; width: 100%;"
        >
          {#each virtualItems as virtualItem, idx (virtualItem.index)}
            <div bind:this={virtualItemEls[idx]} data-index={virtualItem.index} class="terminal-row" 
              style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualItem.start}px);">
              {@html items[virtualItem.index]?.html ?? '&nbsp;'}
            </div>
          {/each}
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

  .history-button {
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

  .history-button:hover {
    border-color: #777777;
    color: #aaaaaa;
  }

  .history-button:focus {
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

  .scroll-container {
    overflow-y: auto;
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