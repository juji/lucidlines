const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Storage key for localStorage
const STORAGE_KEY = 'terminal-ui-settings';

// UI store using Svelte 5 runes
export const uiStore = $state({
  fontSize: 14,
  hue: 1,
  saturation: 1,
  lightness: 1,

  // Apply theme to CSS variables
  applyTheme() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--terminal-font-size', `${this.fontSize}px`);
    root.style.setProperty('--terminal-hue', clamp(this.hue, 0, 1).toString());
    root.style.setProperty('--terminal-saturation', clamp(this.saturation, 0, 1).toString());
    root.style.setProperty('--terminal-lightness', clamp(this.lightness, 0, 1).toString());
  },

  // Actions to modify state
  setFontSize(value: number) {
    this.fontSize = clamp(value, 10, 24);
    this.applyTheme();
    this.saveToStorage();
  },

  adjustFontSize(delta: number) {
    this.fontSize = clamp(this.fontSize + delta, 10, 24);
    this.applyTheme();
    this.saveToStorage();
  },

  setHue(value: number) {
    this.hue = clamp(value, 0, 1);
    this.applyTheme();
    this.saveToStorage();
  },

  setSaturation(value: number) {
    this.saturation = clamp(value, 0, 1);
    this.applyTheme();
    this.saveToStorage();
  },

  setLightness(value: number) {
    this.lightness = clamp(value, 0, 1);
    this.applyTheme();
    this.saveToStorage();
  },

  // Save to localStorage
  saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        fontSize: this.fontSize,
        hue: this.hue,
        saturation: this.saturation,
        lightness: this.lightness
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save UI settings to localStorage:', e);
    }
  }
});

// Load from localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      uiStore.fontSize = parsed.fontSize ?? 14;
      uiStore.hue = parsed.hue ?? 1;
      uiStore.saturation = parsed.saturation ?? 1;
      uiStore.lightness = parsed.lightness ?? 1;
    }
  } catch (e) {
    console.warn('Failed to load UI settings from localStorage:', e);
  }

  // Apply initial theme
  uiStore.applyTheme();
}