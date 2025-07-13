import { createMatrixFilters } from './modules/createMatrixFilters';

const applyStyles = (stateForDomain) => {
  const style = document.createElement('style');
  style.id = 'arcboostify-styles';

  // If disabled, remove any existing styles and SVG filters
  if (!stateForDomain.enabled) {
    style.textContent = '';
    const existingStyle = document.getElementById('arcboostify-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    const existingSvg = document.getElementById('arcboostify-svg-filters');
    if (existingSvg) {
      existingSvg.remove();
    }
    return;
  }

  // Create and inject SVG filter for combined matrix transformation
  const existingSvg = document.getElementById('arcboostify-svg-filters');
  if (existingSvg) {
    existingSvg.remove();
  }

  const svgFilter = createMatrixFilters(stateForDomain);
  (document.head || document.documentElement).appendChild(svgFilter);

  const filterHtml = 'url(#arc-combined-filter)';
  const filterInverse = 'url(#arc-inverse-combined-filter)';

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
      filter: ${filterHtml} !important; 
      transition: none !important;
    }

    ${
      !stateForDomain.enabledImg
        ? `
      img, picture:not(:has(img, svg, picture)) {
        filter: ${filterInverse} !important;
        transition: none !important;
      }`
        : ''
    }

    ${
      !stateForDomain.enabledSvg
        ? `
      svg {
        filter: ${filterInverse} !important;
        transition: none !important;
      }`
        : ''
    }

    canvas, video, iframe, object, embed {
      filter: ${filterInverse} !important;
      transition: none !important;
    }

    ${
      !stateForDomain.enabledText
        ? `
      :is(p, span, h1, h2, h3, h4, h5, h6, li):not(:has(:is(p, span, svg, img, picture, div, article, section,
      header, footer, nav, main))) {
        filter: ${filterInverse} !important;
      }`
        : ''
    }
  `;

  const existingStyle = document.getElementById('arcboostify-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  (document.head || document.documentElement).appendChild(style);
};

// Add this new function to ensure SVG filter is always present
const ensureSvgFilterExists = (stateForDomain) => {
  if (!stateForDomain.enabled) {
    return;
  }

  const existingSvg = document.getElementById('arcboostify-svg-filters');
  if (!existingSvg) {
    const svgFilter = createMatrixFilters(stateForDomain);
    (document.head || document.documentElement).appendChild(svgFilter);
  }
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

    // Set up MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;

      mutations.forEach((mutation) => {
        // Check if our SVG filter was removed
        if (mutation.type === 'childList' && mutation.removedNodes) {
          for (const node of mutation.removedNodes) {
            if (
              node.id === 'arcboostify-svg-filters' ||
              (node.querySelector &&
                node.querySelector('#arcboostify-svg-filters'))
            ) {
              shouldReapply = true;
              break;
            }
          }
        }

        // Check if head or documentElement was replaced
        if (
          mutation.type === 'childList' &&
          (mutation.target === document.head ||
            mutation.target === document.documentElement)
        ) {
          shouldReapply = true;
        }
      });

      if (shouldReapply) {
        // Remove delay entirely for immediate injection
        ensureSvgFilterExists(stateForDomain);
      }
    });

    // Start observing with more aggressive settings
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
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
