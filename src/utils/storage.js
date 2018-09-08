export const prefix = 'flatland:';

/**
 * Utility wrapper functions for window.localStorage. This is essentially a static class that uses
 * a hardcoded prefix for global namespacing.
 */
const ls = {
  getItem: (key) => window.localStorage.getItem(`${prefix}${key}`),
  setItem: (key, item) => window.localStorage.setItem(`${prefix}${key}`, item),
  removeItem: (key) => window.localStorage.removeItem(`${prefix}${key}`),
};

/**
 * Utility wrapper functions for window.sessionStorage. This is essentially a static class that
 * uses a hardcoded prefix for global namespacing.
 */
const ss = {
  getItem: (key) => window.sessionStorage.getItem(`${prefix}${key}`),
  setItem: (key, item) => window.sessionStorage.setItem(`${prefix}${key}`, item),
  removeItem: (key) => window.sessionStorage.removeItem(`${prefix}${key}`),
};

const Storage = {
  ls,
  ss,
};

export default Storage;
