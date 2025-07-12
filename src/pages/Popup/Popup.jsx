import React, { useState, useEffect } from 'react';
import './Popup.css';
import { Range } from './Range/Range';
import { Checkbox } from './Checkbox/Checkbox';
import logo from '../../assets/img/icon-128.png';

const storage = chrome.storage?.local;

const initialState = {
  enabled: false,
  fontFamily: '',
  letterSpacing: 0,
  hue: 0,
  contrast: 1,
  brightness: 1,
  saturation: 1,
  sepia: 0,
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

  const handleSepiaChange = (e) => {
    setState((prev) => ({
      ...prev,
      sepia: e.target.value,
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

        <label>Sepia</label>
        <Range
          value={state.sepia}
          onChange={handleSepiaChange}
          min={0}
          max={1}
          step={0.01}
        />

        <Checkbox
          checked={state.enabled}
          onChange={handleEnabledChange}
          label="Enable on this page"
        />
      </section>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default Popup;
