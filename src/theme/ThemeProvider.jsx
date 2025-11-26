import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import {
  saveUserPreferences,
  subscribeToUserPreferences,
} from "../services/userDataService";

const ThemeCtx = createContext({ theme: "light", toggle: () => {} });
export const UseTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const user = useSelector(selectCurrentUser);

  //️⃣ 1 — تحميل الثيم عند الدخول
  useEffect(() => {
    if (!user?.uid) {
      // مستخدم غير مسجل → استخدم localStorage
      const saved = localStorage.getItem("theme") || "light";
      setTheme(saved);
      return;
    }

    // مستخدم مسجل → احصل على الثيم من Firebase
    const unsubscribe = subscribeToUserPreferences(user.uid, (preferences) => {
      if (preferences && typeof preferences.theme === "string") {
        setTheme((prev) => {
          // لو Firebase رجّع نفس القيمة → لا تغيّر شيء
          if (preferences.theme === prev) return prev;
          return preferences.theme;
        });
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  //️⃣ 2 — تطبيق الثيم على صفحة HTML
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);

    // (⚠️ مهم) لا تحفظ هنا! حتى لا يحدث Loop
    // سيتم الحفظ فقط عند toggle
  }, [theme]);

  //️⃣ 3 — تبديل الثيم + حفظ الاختيار
  const toggle = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";

      // حفظ للمستخدم المسجل
      if (user?.uid) {
        saveUserPreferences(user.uid, { theme: newTheme }).catch(console.error);
      } else {
        // حفظ في localStorage لغير المسجلين
        localStorage.setItem("theme", newTheme);
      }

      return newTheme;
    });
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
