// src/pages/UserSettings/components/Navigation.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { navCategories, navItems } from "../utils/constants";
import ProfileAvatar from "./ProfileAvatar";
import { UseTheme } from "../../../theme/ThemeProvider";

const buildInitials = (name) =>
  (name || "User")
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

export default function Navigation({
  activeCategory,
  activeSection,
  filteredNavItems,
  activeCategoryCopy,
  handleCategoryChange,
  scrollToSection,
  variant = "standalone",
  user,
  profileForm,
}) {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const { t } = useTranslation();

  // USER DISPLAY INFO
  const name = useMemo(() => {
    if (profileForm?.firstName || profileForm?.lastName) {
      return `${profileForm.firstName || ""} ${profileForm.lastName || ""}`.trim();
    }
    return user?.name || t("settings.personal_info", "Your Profile");
  }, [profileForm, user]);

  const email = user?.email || "—";
  const photo = profileForm?.photoURL || user?.photoURL || user?.photoUrl || "";

  const initials = useMemo(() => buildInitials(name), [name]);
  const [avatarError, setAvatarError] = useState(false);

  // CATEGORY INFO
  const getLabel = (item) => t(item.labelKey || "", item.label || "");
  const getDesc = (item) => t(item.descriptionKey || "", item.description || "");

  const categoryLabel = getLabel(activeCategoryCopy) || "Profile";
  const categoryDesc =
    getDesc(activeCategoryCopy) || "Personal information and preferences";

  // 🎨 THEME PALETTE — NEON EMERALD CYBER
  const bgGlass = isDark
    ? "bg-emerald-950/40 border border-emerald-900/40 backdrop-blur-xl"
    : "bg-white border border-emerald-200 shadow-sm";

  const capsuleActive = isDark
    ? "bg-emerald-900/40 border-emerald-600/70 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
    : "bg-emerald-100 border-emerald-300 text-emerald-800";

  const capsuleIdle = isDark
    ? "bg-slate-900/40 border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white"
    : "bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700";

  const sectionActive = isDark
    ? "bg-emerald-900/40 text-emerald-200 border border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";

  const sectionIdle = isDark
    ? "text-slate-300 hover:bg-slate-800/70 hover:text-white"
    : "text-slate-600 hover:bg-white hover:text-slate-900";

  // ---------------------------------------------------------------------
  // EMBEDDED (mobile-like)
  // ---------------------------------------------------------------------
  if (variant === "embedded") {
    return (
      <div className="space-y-6">
        {/* CATEGORY TABS */}
        <div className="flex gap-2 rounded-2xl p-1 bg-slate-900/20 backdrop-blur-md">
          {navCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  flex-1 rounded-xl px-2 py-3 text-[11px] font-medium transition-all
                  flex flex-col items-center justify-center gap-1
                  ${isActive ? capsuleActive : capsuleIdle}
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate px-1">{getLabel(cat)}</span>
              </button>
            );
          })}
        </div>

        {/* SECTIONS */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{categoryLabel}</h3>
            <p className="text-xs text-emerald-200/70 mt-1">{categoryDesc}</p>
          </div>

          <div className="space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    flex items-center w-full gap-3 rounded-xl px-4 py-3 text-sm transition-all
                    ${isActive ? sectionActive : sectionIdle}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="truncate text-sm font-semibold">{getLabel(item)}</p>
                    <p className="truncate text-xs opacity-70">{getDesc(item)}</p>
                  </div>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // FULL SIDEBAR VERSION (STANDALONE)
  // ---------------------------------------------------------------------
  return (
    <>
      {/* USER CARD */}
      <div
        className={`
          rounded-3xl p-6 mb-4 transition-all duration-300
          ${bgGlass}
          shadow-[0_0_18px_rgba(0,0,0,0.4)]
        `}
      >
        <div className="flex items-center gap-4">
          <ProfileAvatar
            photo={!avatarError ? photo : ""}
            initials={initials}
            onError={() => setAvatarError(true)}
            size="md"
            name={name}
            className="ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          />

          <div>
            <p className="text-lg font-semibold text-emerald-200">{name}</p>
            <p className="text-sm text-emerald-300/80">{email}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-emerald-200/70">
          {t(
            "settings.profile_helper_text",
            "Keep your personal information accurate to ensure better recommendations and service."
          )}
        </p>
      </div>

      {/* CATEGORY SELECTOR */}
      <div
        className={`
          rounded-3xl p-5 mb-4 transition-all duration-300
          ${bgGlass}
        `}
      >
        <p className="text-xs tracking-wider uppercase text-emerald-300 font-semibold">
          {t("settings.navigation.focus_area", "Focus area")}
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {navCategories.map((cat) => {
            const active = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  rounded-2xl px-3 py-3 transition-all font-semibold text-sm flex items-center gap-3
                  ${active ? capsuleActive : capsuleIdle}
                `}
              >
                <Icon className="h-4 w-4" />
                {getLabel(cat)}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-emerald-200/70">{categoryDesc}</p>
      </div>

      {/* SECTIONS LIST */}
      <nav
        className={`
          rounded-3xl p-5 space-y-6
          ${bgGlass}
        `}
      >
        {navCategories.map((cat) => {
          const Icon = cat.icon;
          const items = navItems.filter((i) => i.category === cat.id);

          return (
            <div key={cat.id} className="space-y-2">
              {/* Category Title */}
              <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {getLabel(cat)}
              </p>

              {/* Section Buttons */}
              <div className="space-y-2">
                {items.map((item) => {
                  const Icon2 = item.icon;
                  const active = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      className={`
                        flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm
                        transition-all duration-200
                        ${active ? sectionActive : sectionIdle}
                      `}
                      onClick={() => scrollToSection(item.id)}
                    >
                      <Icon2 className="h-4 w-4 text-emerald-300" />

                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold">{getLabel(item)}</p>
                        <p className="truncate text-xs opacity-70">{getDesc(item)}</p>
                      </div>

                      {active && (
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}
