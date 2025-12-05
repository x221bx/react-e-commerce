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

const Navigation = ({
  activeCategory,
  activeSection,
  filteredNavItems,
  activeCategoryCopy,
  handleCategoryChange,
  scrollToSection,
  variant = "standalone",
  user,
  profileForm,
}) => {
  const { theme } = UseTheme();
  const isDarkMode = theme === "dark";
  const { t } = useTranslation();
  const displayName = useMemo(() => {
    if (profileForm?.firstName || profileForm?.lastName) {
      return `${profileForm.firstName || ""} ${profileForm.lastName || ""}`.trim();
    }
    return user?.name || t("settings.personal_info", "Your Profile");
  }, [profileForm?.firstName, profileForm?.lastName, user?.name]);

  const email = user?.email || profileForm?.email || "—";
  const navPhoto = profileForm?.photoURL || user?.photoURL || user?.photoUrl || "";
  const [avatarError, setAvatarError] = useState(false);
  const initials = useMemo(() => buildInitials(displayName), [displayName]);

  const getCategoryLabel = (category) => {
    if (!category) return "";
    if (category.labelKey) {
      return t(category.labelKey, { defaultValue: category.label || "" });
    }
    return category.label || "";
  };
  const getCategoryDescription = (category) => {
    if (!category) return "";
    if (category.descriptionKey) {
      return t(category.descriptionKey, { defaultValue: category.description || "" });
    }
    return category.description || "";
  };
  const getCategoryHelper = (category) => {
    if (!category) return "";
    if (category.helperKey) {
      return t(category.helperKey, { defaultValue: category.helper || "" });
    }
    return category.helper || "";
  };
  const getItemLabel = (item) => {
    if (!item) return "";
    if (item.labelKey) {
      return t(item.labelKey, { defaultValue: item.label || "" });
    }
    return item.label || "";
  };
  const getItemDescription = (item) => {
    if (!item) return "";
    if (item.descriptionKey) {
      return t(item.descriptionKey, { defaultValue: item.description || "" });
    }
    return item.description || "";
  };

  const activeCategoryLabel = getCategoryLabel(activeCategoryCopy) || "Profile";
  const activeCategoryDescription = getCategoryDescription(activeCategoryCopy) || "Personal information and security";
  const activeCategoryHelper = getCategoryHelper(activeCategoryCopy) || "Keep your personal and security details accurate.";

const categoryActiveClasses = isDarkMode
  ? "bg-[#144344] text-white shadow-lg"
  : "bg-[#2F7E80] !text-white shadow";
  const categoryIdleClasses = isDarkMode
  ? "bg-[#0f1d1d] text-slate-300 hover:bg-[#142626]"
  : "bg-white text-slate-600 hover:bg-slate-100";
  const sectionActiveClasses = isDarkMode
    ? "bg-emerald-900/30 text-emerald-200 border border-emerald-800"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  const sectionIdleClasses = isDarkMode
    ? "text-slate-300 hover:bg-slate-800/70 hover:text-white"
    : "text-slate-600 hover:bg-white hover:text-slate-900";

  if (variant === "embedded") {
    return (
      <div className="space-y-6">
        {/* Category Tabs - Mobile-First Design */}
        <div className="flex gap-1 rounded-2xl bg-transparent">
          {navCategories.map((category) => {
            const isCategoryActive = category.id === activeCategory;
            const CategoryIcon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`flex-1 min-h-[60px] rounded-xl px-2 py-2 text-xs font-medium transition-all touch-manipulation flex flex-col items-center justify-center gap-1 ${
                  isCategoryActive ? categoryActiveClasses : categoryIdleClasses
                }`}
                aria-pressed={isCategoryActive}
              >
                <CategoryIcon className="h-4 w-4 flex-shrink-0 icon-primary" />
                <span className="text-center leading-tight text-[10px] px-1">
                  {getCategoryLabel(category)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section List with Descriptions */}
        <div className="space-y-3">
          <div>
            <h3 className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
              {activeCategoryLabel}
            </h3>
            <p className={`mt-1 text-xs ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              {activeCategoryDescription}
            </p>
          </div>

          <div className="space-y-2">
            {filteredNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all touch-manipulation ${
                    isActive ? sectionActiveClasses : sectionIdleClasses
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0 icon-primary" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate text-sm">{getItemLabel(item)}</div>
                    <div className="text-xs opacity-75 truncate leading-tight">
                      {getItemDescription(item)}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 ml-1" aria-hidden="true"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Standalone navigation
  return (
    <>
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            photo={!avatarError ? navPhoto : ""}
            initials={initials}
            onError={() => setAvatarError(true)}
            size="md"
            name={displayName}
          />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {displayName || t("settings.personal_info", "Your Profile")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {email}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "settings.profile_helper_text",
            "Keep your farming profile updated so we can provide personalized agricultural recommendations and veterinary care tips."
          )}
        </p>
      </div>

      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("settings.navigation.focus_area", "Focus area")}
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {navCategories.map((category) => {
            const isCategoryActive = category.id === activeCategory;
            const CategoryIcon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  isCategoryActive
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white dark:bg-green-500"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                aria-pressed={isCategoryActive}
              >
                <span className="inline-flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 flex-shrink-0 icon-primary" />
                  <span className="truncate">{getCategoryLabel(category)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {activeCategoryHelper}
        </p>
      </div>

      <nav
        className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        aria-label={t("settings.navigation.aria_label", "Profile settings sections")}
      >
        {navCategories.map((category) => {
          const items = navItems.filter((item) => item.category === category.id);
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 flex-shrink-0 icon-primary" />
                  <span className="truncate">{getCategoryLabel(category)}</span>
                </span>
              </p>
              <div className="space-y-2">
                {items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-gradient-to-r from-green-100 to-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                          : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800/70"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0 icon-primary" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="truncate">{getItemLabel(item)}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400 truncate">
                          {getItemDescription(item)}
                        </span>
                      </div>
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
};

export default Navigation;
