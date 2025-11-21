import React from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../SectionCard";
import NotificationToggle from "../NotificationToggle";
import { notificationOptions } from "../../utils/constants";

const NotificationsSection = ({
  sectionId,
  notificationsRef,
  notificationForm,
  handleNotificationsChange,
  handleNotificationsSubmit,
  isSavingNotifications
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard
      sectionId={sectionId}
      innerRef={notificationsRef}
      eyebrow={t("settings.notificationsSection", "Notifications")}
      title={t("settings.notificationsTitle", "Control how we keep you informed")}
      description={t("settings.notificationsDescription", "Choose the updates you care about.")}
    >
    <form onSubmit={handleNotificationsSubmit} className="space-y-5">
      <div className="space-y-4">
        {Object.entries(notificationForm).map(([key, value]) => {
          const metadata = notificationOptions[key] || {};
          const label = metadata.labelKey
            ? t(metadata.labelKey, metadata.label || key)
            : key.replace(/([A-Z])/g, " $1").replace(/^\w/, (char) => char.toUpperCase());
          const description = metadata.descriptionKey
            ? t(metadata.descriptionKey, metadata.description || "")
            : t("settings.notificationDescription", "Stay informed with timely updates.");

          return (
            <NotificationToggle
              key={key}
              label={label}
              description={description}
              enabled={value}
              onToggle={() => handleNotificationsChange(key)}
            />
          );
        })}
      </div>
      <button
        type="submit"
        disabled={isSavingNotifications}
        className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-70"
      >
        {isSavingNotifications ? t("settings.savingNotifications", "Saving...") : t("settings.savePreferences", "Save preferences")}
      </button>
    </form>
  </SectionCard>
  );
};

export default NotificationsSection;
