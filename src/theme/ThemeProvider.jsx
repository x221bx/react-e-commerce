import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { saveUserPreferences, subscribeToUserPreferences } from "../services/userDataService";

const ThemeCtx = createContext({ theme: "light", toggle: () => {} });
export const UseTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const user = useSelector(selectCurrentUser);

  // Subscribe to user preferences from Firebase
  useEffect(() => {
    if (!user?.uid) {
      // Use localStorage for non-authenticated users
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
      return;
    }

    const unsubscribe = subscribeToUserPreferences(user.uid, (preferences) => {
      const userTheme = preferences?.theme || "light";
      setTheme(userTheme);
    });

    return unsubscribe;
  }, [user?.uid]);

  // Apply theme to DOM and save to Firebase/localStorage
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);

    if (user?.uid) {
      // Save to Firebase for authenticated users
      saveUserPreferences(user.uid, { theme }).catch(console.error);
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem("theme", theme);
    }
  }, [theme, user?.uid]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
