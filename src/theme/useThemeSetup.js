import { useEffect } from 'react';

export function useThemeSetup(theme) {
  useEffect(() => {
    // Make sure we're in the browser
    if (typeof window === 'undefined') return;

    try {
      // Get the root HTML element
      const root = document.querySelector('html');
      if (!root) {
        console.error('Could not find HTML element');
        return;
      }

      // Debug logging
      console.log('Current theme:', theme);
      console.log('Current classes:', root.classList.toString());

      // Force remove and add appropriate class
      root.classList.remove('light', 'dark');
      root.classList.add(theme);

      // Store in localStorage
      localStorage.setItem('theme', theme);

      // Debug logging after update
      console.log('Updated classes:', root.classList.toString());
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }, [theme]);
}
