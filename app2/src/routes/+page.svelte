<script lang="ts">
  import Terminal from '$lib/components/terminal.svelte';
  import HeaderControls from '$lib/components/header-controls.svelte';
  import { terminalStore } from '$lib/stores/terminal-store.svelte';
  import { websocketStore } from '$lib/stores/websocket-store.svelte';

  // Get log types from the store
  let logTypes = $derived(terminalStore.logTypes);

  // All terminals are active by default (can be toggled)
  let activeTerminals = $state<Record<string, boolean>>({});

  // Initialize WebSocket connection on mount
  $effect(() => {
    websocketStore.connect();
  });

  // Initialize active terminals when log types change
  $effect(() => {
    const newActiveTerminals: Record<string, boolean> = {};
    logTypes.forEach(type => {
      const key = type.toLowerCase();
      // Default to true for all terminals
      newActiveTerminals[key] = true;
    });
    activeTerminals = newActiveTerminals;
  });

  // Toggle terminal visibility
  function toggleTerminal(id: string) {
    activeTerminals[id] = !activeTerminals[id];
  }

  // Check if we have multiple active terminals
  let hasMultipleTerminals = $derived(Object.values(activeTerminals).filter(Boolean).length > 1);
</script>

<div class="app-container">
  <header class="app-header">
    <div class="tabs">
      {#each logTypes as type}
        <button
          class={activeTerminals[type.toLowerCase()] ? 'active' : ''}
          onclick={() => toggleTerminal(type.toLowerCase())}
        >
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
        </button>
      {/each}
    </div>
    <HeaderControls />
  </header>
  <main class={hasMultipleTerminals ? 'multi-terminal' : ''}>
    {#each logTypes as type}
      {#if activeTerminals[type.toLowerCase()]}
        <Terminal
          logType={type}
          log={type === 'REACT'}
          title={type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
          onClose={() => toggleTerminal(type.toLowerCase())}
        />
      {/if}
    {/each}
  </main>
</div>

<style>
  :global(#root) {
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
  }

  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #1f1f1f;
    color: #f0f0f0;
    padding: 0.5rem 1rem;
    gap: 1rem;
    border-bottom: 1px solid #333333;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tabs button {
    background-color: #2a2a2a;
    color: #b0b0b0;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
    outline: none; /* Remove outline */
    position: relative;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
  }

  .tabs button:focus {
    outline: none; /* Remove focus outline */
  }

  .tabs button:hover {
    border-color: #444444;
  }

  .tabs button.active {
    background-color: #3a3a3a;
    color: #ffffff;
    border-bottom: 2px solid #2b83ff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    margin-bottom: -1px; /* Pull active tab border over header divider */
  }

  main {
    flex: 1;
    background-color: #111111;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: calc(100% - 48px);
  }

  /* For multiple terminals, use a grid layout */
  main.multi-terminal {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Fixed 2 columns for better sizing */
    grid-template-rows: 1fr 1fr; /* Two equal rows, filling the space */
    gap: 8px;
    padding: 8px;
    height: calc(100vh - 48px); /* Full viewport height minus header */
    overflow: hidden; /* No scrolling needed as we're filling the space */
  }

  main.multi-terminal .terminal-container {
    width: 100%;
    height: 100%; /* Fill the grid cell completely */
    min-height: 0; /* Override the min-height from general styles */
    overflow: hidden;
    margin: 0;
  }
</style>
