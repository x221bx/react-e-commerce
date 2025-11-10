import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useSelector } from "react-redux";

const LS_KEY = "ui.locale";

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const [lang, setLang] = useState(() => localStorage.getItem(LS_KEY) || "en");

  // apply on mount
  useEffect(() => {
    changeLanguage(lang, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeLanguage(next, persist = true) {
    await i18n.changeLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    if (persist) {
      localStorage.setItem(LS_KEY, next);
      if (user?.uid) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            "preferences.locale": next,
          });
        } catch {}
      }
    }
    setLang(next);
  }

  return (
    <div
      className={`inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm ${className}`}
    >
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1.5 text-sm font-medium ${lang === "en" ? "bg-[#49BBBD]/10 text-[#2F7E80] ring-1 ring-[#49BBBD]/30" : "text-gray-700 hover:bg-[#49BBBD]/5"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("ar")}
        className={`px-3 py-1.5 text-sm font-medium ${lang === "ar" ? "bg-[#49BBBD]/10 text-[#2F7E80] ring-1 ring-[#49BBBD]/30" : "text-gray-700 hover:bg-[#49BBBD]/5"}`}
        aria-pressed={lang === "ar"}
      >
        AR
      </button>
    </div>
  );
}
