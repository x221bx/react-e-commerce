import React from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileAvatar from "./ProfileAvatar";
import { formatLastUpdated, formatLocaleLabel, formatMeasurementLabel, formatStatusLabel } from "../utils/helpers";

const OverviewCard = ({ user, profileForm, preferenceForm, scrollToSection }) => {
  const currentName = React.useMemo(() => {
    if (profileForm.firstName || profileForm.lastName) {
      return `${profileForm.firstName} ${profileForm.lastName}`.trim();
    }
    return user?.name || "Account";
  }, [profileForm.firstName, profileForm.lastName, user?.name]);

  const initials = React.useMemo(() => {
    return (currentName || "A")
      .split(" ")
      .filter(Boolean)
      .map((chunk) => chunk[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [currentName]);

  const profilePhoto = React.useMemo(() => {
    return (
      profileForm.photoURL?.trim() ||
      user?.photoURL ||
      user?.photoUrl ||
      ""
    );
  }, [profileForm.photoURL, user?.photoURL, user?.photoUrl]);

  const heroChips = React.useMemo(() => {
    const chips = [];
    if (profileForm.location) {
      chips.push({ label: profileForm.location, tone: "outline" });
    }
    chips.push({
      label: user?.isAdmin === true ? "Administrator" : "Customer",
      tone: "solid",
    });
    chips.push({
      label: formatLocaleLabel(preferenceForm.locale),
      tone: "outline",
    });
    chips.push({
      label: formatMeasurementLabel(preferenceForm.measurement),
      tone: "outline",
    });
    return chips;
  }, [
    profileForm.location,
    user?.role,
    preferenceForm.locale,
    preferenceForm.measurement,
  ]);

  const heroStats = React.useMemo(() => {
    const notificationForm = { productUpdates: true, orderUpdates: true, securityAlerts: true, marketingEmails: false }; // Default for demo
    const activeNotificationCount = Object.values(notificationForm).filter(Boolean).length;

    return [
      {
        label: "Account Status",
        value: formatStatusLabel(user?.accountStatus || "active"),
      },
      {
        label: "Interface Language",
        value: formatLocaleLabel(preferenceForm.locale),
      },
      {
        label: "Notifications",
        value: `${activeNotificationCount}/${Object.keys(notificationForm).length} enabled`,
      },
    ];
  }, [preferenceForm.locale, user?.accountStatus]);

  const lastUpdatedInfo = React.useMemo(() => formatLastUpdated(user?.updatedAt), [user?.updatedAt]);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              photo={profilePhoto}
              initials={initials}
              size="md"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                Unified settings hub
              </p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Hi {currentName || "there"}, keep everything aligned
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Personal info, preferences, notifications, and account safety share the same design in
                /settings and /account/settings.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {heroChips.map((chip) => (
              <span
                key={chip.label}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  chip.tone === "solid"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200"
                }`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-100 bg-white/80 p-3 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  {stat.label}
                </p>
                <p className="text-base font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/70 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Last activity
            </p>
            <div className="flex items-baseline gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <p className="text-base font-semibold">{lastUpdatedInfo.relative}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300">{lastUpdatedInfo.absolute}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToSection("personal")}
              className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("security")}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Review security
            </button>
            <Link
              to="/articles"
              className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200"
            >
              Browse articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewCard;
