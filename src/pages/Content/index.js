const applyStyles = (stateForDomain) => {
  const style = document.createElement('style');
  style.id = 'arcboostify-styles';

  // If disabled, remove any existing styles
  if (!stateForDomain.enabled) {
    style.textContent = '';
    const existingStyle = document.getElementById('arcboostify-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    return;
  }

  const inverseHue = -stateForDomain.hue;
  const inverseContrast =
    stateForDomain.contrast !== 0 ? 1 / stateForDomain.contrast : 1;
  const inverseBrightness =
    stateForDomain.brightness !== 0 ? 1 / stateForDomain.brightness : 1;
  const inverseSaturation =
    stateForDomain.saturation !== 0 ? 1 / stateForDomain.saturation : 1;
  const inverseSepia = 0;

  const inverseFilterForImg = `
    sepia(${inverseSepia}) contrast(${inverseContrast}) brightness(${inverseBrightness}) hue-rotate(${inverseHue}deg) saturate(${inverseSaturation}); 
  `;

  const htmlFilter = `
  sepia(${stateForDomain.sepia}) contrast(${stateForDomain.contrast}) brightness(${stateForDomain.brightness}) hue-rotate(${stateForDomain.hue}deg) saturate(${stateForDomain.saturation}); 
  `;

  style.textContent = `
    ${
      stateForDomain.fontFamily
        ? `
    html *:not(i) {
      font-family: "${stateForDomain.fontFamily}" !important;
    }
    `
        : ''
    }

    ${
      stateForDomain.letterSpacing
        ? `
    html *:not(i) {
      letter-spacing: ${stateForDomain.letterSpacing}px !important;
    }
    `
        : ''
    }

    html {
      filter: ${htmlFilter} !important; 
      transition: none !important;
    }

    img, svg, canvas, video, iframe, picture, object, embed {
      filter: ${inverseFilterForImg} !important;
      transition: none !important;
    }
  `;

  const existingStyle = document.getElementById('arcboostify-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  (document.head || document.documentElement).appendChild(style);
};

const initializeStyles = () => {
  chrome.storage.local.get('state').then((res) => {
    if (!res.state) {
      return;
    }

    const hostname = new URL(window.location.href).hostname;
    const stateForDomain = res.state[hostname];

    if (!stateForDomain) {
      return;
    }

    applyStyles(stateForDomain);
  });
};

initializeStyles();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.state) {
    const hostname = new URL(window.location.href).hostname;
    const newState = changes.state.newValue;

    if (newState && newState[hostname]) {
      applyStyles(newState[hostname]);
    }
  }
});
