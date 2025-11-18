import React from "react";
import SectionCard from "../SectionCard";
import NotificationToggle from "../NotificationToggle";

const NotificationsSection = ({
  sectionId,
  notificationsRef,
  notificationForm,
  handleNotificationsChange,
  handleNotificationsSubmit,
  isSavingNotifications
}) => (
  <SectionCard
    sectionId={sectionId}
    innerRef={notificationsRef}
    eyebrow="Notifications"
    title="Control how we keep you informed"
    description="Choose the updates you care about."
  >
    <form onSubmit={handleNotificationsSubmit} className="space-y-5">
      <div className="space-y-4">
        {Object.entries(notificationForm).map(([key, value]) => (
          <NotificationToggle
            key={key}
            label={key.replace(/([A-Z])/g, " $1").replace(/^\w/, (char) => char.toUpperCase()).trim()}
            description="Stay informed with timely updates."
            enabled={value}
            onToggle={() => handleNotificationsChange(key)}
          />
        ))}
      </div>
      <button
        type="submit"
        disabled={isSavingNotifications}
        className="inline-flex items-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-70"
      >
        {isSavingNotifications ? "Saving..." : "Save preferences"}
      </button>
    </form>
  </SectionCard>
);

export default NotificationsSection;