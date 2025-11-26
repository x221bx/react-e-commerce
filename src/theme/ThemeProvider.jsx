import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { saveUserPreferences, subscribeToUserPreferences } from "../services/userDataService";

const ThemeCtx = createContext({ theme: "light", toggle: () => {} });
export const UseTheme = () => useContext(ThemeCtx);

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore storage errors */
  }
  return "light"; // default start: light mode
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const user = useSelector(selectCurrentUser);

  // Sync from user preferences when authenticated
  useEffect(() => {
    if (!user?.uid) {
      setTheme(getInitialTheme());
      return;
    }

    const unsubscribe = subscribeToUserPreferences(user.uid, (preferences) => {
      if (preferences && typeof preferences.theme === "string") {
        setTheme((prev) => (preferences.theme === prev ? prev : preferences.theme));
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  // Apply theme class to <html> and persist for guests
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";

      if (user?.uid) {
        saveUserPreferences(user.uid, { theme: next }).catch(console.error);
      } else {
        try {
          localStorage.setItem("theme", next);
        } catch {
          /* ignore */
        }
      }

      return next;
    });
  };

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
