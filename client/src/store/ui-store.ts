import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface UIValues {
  fontSize: number;
  hue: number;
  saturation: number;
  lightness: number;
}

interface UIState extends UIValues {
  setFontSize: (value: number) => void;
  adjustFontSize: (delta: number) => void;
  setHue: (value: number) => void;
  setSaturation: (value: number) => void;
  setLightness: (value: number) => void;
}

const STORAGE_KEY = 'terminal-ui-settings';

const initialValues: UIValues = {
  fontSize: 14,
  hue: 1,
  saturation: 1,
  lightness: 1,
};

const fallbackStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const storage = createJSONStorage<UIValues>(() =>
  typeof window === 'undefined' ? fallbackStorage : window.localStorage
);

const applyTheme = (values: UIValues) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const { fontSize, hue, saturation, lightness } = values;

  root.style.setProperty('--terminal-font-size', `${fontSize}px`);
  root.style.setProperty('--terminal-hue', clamp(hue, 0, 1).toString());
  root.style.setProperty('--terminal-saturation', clamp(saturation, 0, 1).toString());
  root.style.setProperty('--terminal-lightness', clamp(lightness, 0, 1).toString());
};

const pickValues = (state: UIState): UIValues => ({
  fontSize: state.fontSize,
  hue: state.hue,
  saturation: state.saturation,
  lightness: state.lightness,
});

if (typeof document !== 'undefined') {
  applyTheme(initialValues);
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialValues,
      setFontSize: (value: number) => {
        const clamped = clamp(value, 10, 24);
        const updated = { ...pickValues(get()), fontSize: clamped };
        set({ fontSize: clamped });
        applyTheme(updated);
      },
      adjustFontSize: (delta: number) => {
        const current = get().fontSize;
        const next = clamp(current + delta, 10, 24);
        const updated = { ...pickValues(get()), fontSize: next };
        set({ fontSize: next });
        applyTheme(updated);
      },
      setHue: (value: number) => {
        const hue = clamp(value, 0, 1);
        const updated = { ...pickValues(get()), hue };
        set({ hue });
        applyTheme(updated);
      },
      setSaturation: (value: number) => {
        const saturation = clamp(value, 0, 1);
        const updated = { ...pickValues(get()), saturation };
        set({ saturation });
        applyTheme(updated);
      },
      setLightness: (value: number) => {
        const lightness = clamp(value, 0, 1);
        const updated = { ...pickValues(get()), lightness };
        set({ lightness });
        applyTheme(updated);
      },
    }),
    {
      name: STORAGE_KEY,
      storage,
      partialize: state => pickValues(state),
      onRehydrateStorage: () => state => {
        if (!state) {
          applyTheme(initialValues);
          return;
        }
        applyTheme(pickValues(state as UIState));
      },
    }
  )
);
