import React, { useState, useEffect } from 'react';
import './Popup.css';
import { Range } from './Range/Range';
import { Checkbox } from './Checkbox/Checkbox';
import { RgbaColorPicker } from 'react-colorful';
import icon from '../../assets/img/icon-128.png';

const storage = chrome.storage?.local;

const initialState = {
  enabled: false,
  enabledSvg: false,
  enabledImg: false,
  enabledText: false,
  fontFamily: '',
  letterSpacing: 0,
  hue: 0,
  contrast: 1,
  brightness: 1,
  saturation: 1,
  tint: {
    r: 155,
    g: 111,
    b: 25,
    a: 0.5,
  },
};

const Popup = () => {
  const [state, setState] = useState();

  const handleFontFamilyChange = (e) => {
    setState((prev) => ({
      ...prev,
      fontFamily: e.target.value,
    }));
  };

  const handleContrastChange = (e) => {
    setState((prev) => ({
      ...prev,
      contrast: e.target.value,
    }));
  };

  const handleBrightnessChange = (e) => {
    setState((prev) => ({
      ...prev,
      brightness: e.target.value,
    }));
  };

  const handleSaturationChange = (e) => {
    setState((prev) => ({
      ...prev,
      saturation: e.target.value,
    }));
  };

  const handleTintColorChange = (color) => {
    setState((prev) => ({
      ...prev,
      tint: color,
    }));
  };

  const handleHueChange = (e) => {
    setState((prev) => ({
      ...prev,
      hue: e.target.value,
    }));
  };

  const handleLetterSpacingChange = (e) => {
    setState((prev) => ({
      ...prev,
      letterSpacing: e.target.value,
    }));
  };

  const handleEnabledChange = (e) => {
    setState((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
  };

  const handleEnabledSvgChange = (e) => {
    setState((prev) => ({
      ...prev,
      enabledSvg: e.target.checked,
    }));
  };

  const handleEnabledImgChange = (e) => {
    setState((prev) => ({
      ...prev,
      enabledImg: e.target.checked,
    }));
  };

  const handleEnabledTextChange = (e) => {
    setState((prev) => ({
      ...prev,
      enabledText: e.target.checked,
    }));
  };

  const handleReset = () => {
    setState(initialState);
  };

  const getDomain = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    return new URL(tab.url).hostname;
  };

  useEffect(() => {
    storage.get('state').then((res) => {
      getDomain().then((domain) => {
        setState(
          res?.state?.[domain] || {
            ...initialState,
          }
        );
      });
    });
  }, []);

  useEffect(() => {
    getDomain().then((domain) => {
      storage.get('state').then((res) => {
        storage.set({ state: { ...res.state, [domain]: state } });
      });
    });
  }, [state]);

  if (!state) {
    return null;
  }

  return (
    <div className="App">
      <img src={icon} alt="Web Muralist" className="icon" />
      <section>
        <label>Font Family</label>
        <input
          type="text"
          placeholder="Font Family"
          value={state.fontFamily}
          onChange={handleFontFamilyChange}
        />

        <label>Letter Spacing (px)</label>
        <Range
          value={state.letterSpacing}
          onChange={handleLetterSpacingChange}
          min={-3}
          max={3}
          step={0.1}
        />

        <label>Hue</label>
        <Range
          value={state.hue}
          onChange={handleHueChange}
          min={0}
          max={360}
          step={1}
        />

        <label>Contrast</label>
        <Range
          value={state.contrast}
          onChange={handleContrastChange}
          min={0.5}
          max={1.5}
          step={0.01}
        />

        <label>Brightness</label>
        <Range
          value={state.brightness}
          onChange={handleBrightnessChange}
          min={0.5}
          max={1.5}
          step={0.01}
        />

        <label>Saturation</label>
        <Range
          value={state.saturation}
          onChange={handleSaturationChange}
          min={0.0}
          max={2}
          step={0.01}
        />

        <label>Tint</label>
        <RgbaColorPicker color={state.tint} onChange={handleTintColorChange} />

        <Checkbox
          checked={state.enabled}
          onChange={handleEnabledChange}
          label="Enable on this page"
        />

        <Checkbox
          checked={state.enabledSvg}
          onChange={handleEnabledSvgChange}
          label="Allow on SVG"
        />

        <Checkbox
          checked={state.enabledImg}
          onChange={handleEnabledImgChange}
          label="Allow on images"
        />

        <Checkbox
          checked={state.enabledText}
          onChange={handleEnabledTextChange}
          label="Allow on text"
        />
      </section>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default Popup;
