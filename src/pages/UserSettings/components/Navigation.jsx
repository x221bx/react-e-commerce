import React, { useMemo, useState } from "react";
import { navCategories, navItems } from "../utils/constants";
import ProfileAvatar from "./ProfileAvatar";

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
  const displayName = useMemo(() => {
    if (profileForm?.firstName || profileForm?.lastName) {
      return `${profileForm.firstName || ""} ${profileForm.lastName || ""}`.trim();
    }
    return user?.name || "Your Profile";
  }, [profileForm?.firstName, profileForm?.lastName, user?.name]);

  const email = user?.email || profileForm?.email || "—";
  const navPhoto = profileForm?.photoURL || user?.photoURL || user?.photoUrl || "";
  const [avatarError, setAvatarError] = useState(false);
  const initials = useMemo(() => buildInitials(displayName), [displayName]);

  if (variant === "embedded") {
    return (
      <div className="space-y-6">
        {/* Category Tabs - Mobile-First Design */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl dark:bg-slate-800">
          {navCategories.map((category) => {
            const isCategoryActive = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl text-xs font-medium transition-all touch-manipulation min-h-[60px] ${
                  isCategoryActive
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                aria-pressed={isCategoryActive}
              >
                <span className="text-lg" role="img" aria-label={category.label}>
                  {category.icon}
                </span>
                <span className="text-center leading-tight">{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section List with Descriptions */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {activeCategoryCopy?.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeCategoryCopy?.description}
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
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all touch-manipulation ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" aria-hidden="true"></div>
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
      <div className="rounded-3xl bg-white/95 p-6 shadow-lg ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            photo={!avatarError ? navPhoto : ""}
            initials={initials}
            onError={() => setAvatarError(true)}
            size="md"
          />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {displayName || "Your Profile"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {email}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Keep your profile details updated so we can personalize farm and vet recommendations for you.
        </p>
      </div>

      <div className="rounded-3xl bg-white/95 p-4 shadow-lg ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Focus area
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {navCategories.map((category) => {
            const isCategoryActive = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  isCategoryActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200/40 dark:bg-emerald-500 dark:shadow-emerald-900/40"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                aria-pressed={isCategoryActive}
              >
                {category.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {activeCategoryCopy.helper}
        </p>
      </div>

      <nav
        className="rounded-3xl bg-white/95 p-4 shadow-lg ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-slate-800"
        aria-label="Profile settings sections"
      >
        {navCategories.map((category) => {
          const items = navItems.filter((item) => item.category === category.id);
          return (
            <div key={category.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {category.label}
              </p>
              <div className="space-y-2">
                {items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-50/80 text-emerald-700 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-200"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <IconComponent className="h-4 w-4" />
                      {item.label}
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
