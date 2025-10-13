import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../store/uiStore';

const HeaderControls: React.FC = () => {
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

  return (
    <div className="header-controls">
      <div className="font-controls">
        <span className="font-label">Text</span>
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
      <div className="hsl-controls">
        <label className="hsl-control">
          <span>Hue</span>
          <input
            type="range"
            min={0}
            max={359}
            value={Math.round(hue * 359)}
            onChange={handleHueChange}
          />
        </label>
        <label className="hsl-control">
          <span>Sat</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(saturation * 100)}
            onChange={handleSaturationChange}
          />
        </label>
        <label className="hsl-control">
          <span>Light</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(lightness * 100)}
            onChange={handleLightnessChange}
          />
        </label>
      </div>
    </div>
  );
};

export default HeaderControls;
