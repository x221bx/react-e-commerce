// src/pages/UserSettings/components/ProfileAvatar.jsx
import React from "react";

const ProfileAvatar = ({ photo, initials, onError, size = "lg", className = "", name = "User" }) => {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-28 w-28",
  };

  return (
    <figure
      className={`relative overflow-hidden rounded-2xl 
        bg-slate-100 ring-1 ring-slate-200 
        dark:bg-[#0f1d1d] dark:ring-white/10 
        shadow-inner
        ${sizeClasses[size] || sizeClasses.md} 
        ${className}`}
    >
      {photo ? (
        <img
          src={photo}
          alt={`Profile picture of ${name}`}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable="false"
          onError={onError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center 
            text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
          {initials || "A"}
        </div>
      )}

      <span className="pointer-events-none absolute inset-0 rounded-2xl 
        ring-1 ring-black/5 dark:ring-white/10" />
    </figure>
  );
};

export default ProfileAvatar;
