// Vitest global setup. Adds jest-dom matchers (toBeInTheDocument, etc.) and a
// window.matchMedia stub so components that read media queries don't crash
// under jsdom (which doesn't implement matchMedia).
import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
