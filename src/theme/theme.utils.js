// Utility functions for theme management
export const getInitialTheme = () => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Check localStorage
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }

    // Check user preference
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }

  return 'light';
};