<script lang="ts">
  import { uiStore } from '$lib/stores/ui-store.svelte';

  let isOpen = $state(false);
  let containerRef = $state<HTMLDivElement>();

  function handleHueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    uiStore.setHue(Number(target.value) / 359);
  }

  function handleSaturationChange(event: Event) {
    const target = event.target as HTMLInputElement;
    uiStore.setSaturation(Number(target.value) / 100);
  }

  function handleLightnessChange(event: Event) {
    const target = event.target as HTMLInputElement;
    uiStore.setLightness(Number(target.value) / 100);
  }

  // Handle click outside to close dropdown
  $effect(() => {
    if (!isOpen) return;

    function handlePointer(event: PointerEvent) {
      if (!containerRef?.contains(event.target as Node)) {
        isOpen = false;
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        isOpen = false;
      }
    }

    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  });
</script>

<div class="header-controls" bind:this={containerRef}>
  <button
    type="button"
    class="controls-toggle"
    onclick={() => isOpen = !isOpen}
    aria-haspopup="true"
    aria-expanded={isOpen}
    aria-label="Open terminal display settings"
  >
    ⚙︎
  </button>
  {#if isOpen}
    <div class="controls-dropdown" role="menu">
      <span class="control-label">
        Text
      </span>
      <div class="font-actions" role="group">
        <button
          type="button"
          class="font-button"
          onclick={() => uiStore.adjustFontSize(-1)}
          aria-label="Decrease text size"
        >
          -
        </button>
        <button
          type="button"
          class="font-button"
          onclick={() => uiStore.adjustFontSize(1)}
          aria-label="Increase text size"
        >
          +
        </button>
      </div>

      <label class="control-label" for="hue-slider">
        Hue
      </label>
      <input
        id="hue-slider"
        class="control-slider"
        type="range"
        min={0}
        max={359}
        value={Math.round(uiStore.hue * 359)}
        onchange={handleHueChange}
      />

      <label class="control-label" for="saturation-slider">
        Sat
      </label>
      <input
        id="saturation-slider"
        class="control-slider"
        type="range"
        min={0}
        max={100}
        value={Math.round(uiStore.saturation * 100)}
        onchange={handleSaturationChange}
      />

      <label class="control-label" for="lightness-slider">
        Light
      </label>
      <input
        id="lightness-slider"
        class="control-slider"
        type="range"
        min={0}
        max={100}
        value={Math.round(uiStore.lightness * 100)}
        onchange={handleLightnessChange}
      />
    </div>
  {/if}
</div>

<style>
  .header-controls {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: auto;
    color: #b0b0b0;
  }

  .controls-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2a2a2a;
    border: 1px solid #5a5a5a;
    color: #f0f0f0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.95rem;
    line-height: 1;
    padding: 0.2rem 1rem;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .controls-toggle:hover,
  .controls-toggle:focus-visible {
    background-color: #3a3a3a;
    border-color: #6b6b6b;
  }

  .controls-dropdown {
    position: absolute;
    top: calc(100% + 0.35rem);
    right: 0;
    min-width: 220px;
    display: grid;
    grid-template-columns: max-content minmax(150px, 1fr);
    grid-auto-rows: auto;
    row-gap: 1rem;
    column-gap: 0.6rem;
    align-items: center;
    padding: 1.5rem;
    background-color: #151515;
    border: 1px solid #606060;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  .control-label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: bold;
    color: #b0b0b0;
    justify-self: end;
  }

  .font-actions {
    display: inline-flex;
    align-items: center;
    justify-self: start;
    gap: 0.35rem;
  }

  .font-button {
    width: 1.9rem;
    height: 1.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2a2a2a;
    border: 1px solid #454545;
    color: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    transition: background-color 0.2s ease;
  }

  .font-button:hover {
    background-color: #3a3a3a;
  }

  .control-slider {
    width: 100%;
    accent-color: #888888;
    justify-self: stretch;
  }
</style>