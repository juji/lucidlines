import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../store/ui-store';

const HeaderControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const fontLabelId = useId();
  const hueLabelId = useId();
  const saturationLabelId = useId();
  const lightnessLabelId = useId();

  const [hue, saturation, lightness] = useUIStore(
    useShallow(state => [
      state.hue,
      state.saturation,
      state.lightness,
    ])
  );

  const [adjustFontSize, setHue, setSaturation, setLightness] = useUIStore(
    useShallow(state => [
      state.adjustFontSize,
      state.setHue,
      state.setSaturation,
      state.setLightness,
    ])
  );

  const handleHueChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    event => setHue(Number(event.target.value) / 359),
    [setHue]
  );

  const handleSaturationChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    event => setSaturation(Number(event.target.value) / 100),
    [setSaturation]
  );

  const handleLightnessChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    event => setLightness(Number(event.target.value) / 100),
    [setLightness]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div className="header-controls" ref={containerRef}>
      <button
        type="button"
        className="controls-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open terminal display settings"
      >
        ⚙︎
      </button>
      {isOpen && (
        <div className="controls-dropdown" role="menu">
          <span id={fontLabelId} className="control-label">
            Text
          </span>
          <div className="font-actions" role="group" aria-labelledby={fontLabelId}>
            <button
              type="button"
              className="font-button"
              onClick={() => adjustFontSize(-1)}
              aria-label="Decrease text size"
            >
              -
            </button>
            <button
              type="button"
              className="font-button"
              onClick={() => adjustFontSize(1)}
              aria-label="Increase text size"
            >
              +
            </button>
          </div>

          <label htmlFor={hueLabelId} className="control-label">
            Hue
          </label>
          <input
            id={hueLabelId}
            className="control-slider"
            type="range"
            min={0}
            max={359}
            value={Math.round(hue * 359)}
            onChange={handleHueChange}
          />

          <label htmlFor={saturationLabelId} className="control-label">
            Sat
          </label>
          <input
            id={saturationLabelId}
            className="control-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(saturation * 100)}
            onChange={handleSaturationChange}
          />

          <label htmlFor={lightnessLabelId} className="control-label">
            Light
          </label>
          <input
            id={lightnessLabelId}
            className="control-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(lightness * 100)}
            onChange={handleLightnessChange}
          />
        </div>
      )}
    </div>
  );
};

export default HeaderControls;
