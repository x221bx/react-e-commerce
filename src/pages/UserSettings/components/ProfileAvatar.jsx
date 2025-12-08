// src/pages/UserSettings/components/ProfileAvatar.jsx
import React from "react";

const ProfileAvatar = ({
  photo,
  initials,
  onError,
  size = "lg",
  className = "",
  name = "User",
}) => {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-28 w-28",
  };

  return (
    <figure
      className={`
        relative overflow-hidden rounded-3xl 
        flex items-center justify-center
        bg-gradient-to-br from-emerald-900/20 to-emerald-800/10
        border border-emerald-600/20
        shadow-[0_0_18px_rgba(16,185,129,0.25)] 
        backdrop-blur-md
        transition-all duration-300
        hover:shadow-[0_0_28px_rgba(16,185,129,0.35)]
        hover:border-emerald-500/40
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {/* Floating Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-5 -right-5 h-20 w-20 bg-emerald-500/20 blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 h-16 w-16 bg-emerald-400/10 blur-xl" />
      </div>

      {/* Avatar Content */}
      {photo ? (
        <img
          src={photo}
          alt={`Profile picture of ${name}`}
          className="relative z-[5] h-full w-full object-cover rounded-3xl"
          loading="lazy"
          draggable="false"
          onError={onError}
        />
      ) : (
        <div
          className="
            relative z-[5] 
            flex h-full w-full items-center justify-center
            text-3xl font-bold 
            text-emerald-400 tracking-wide
          "
        >
          {initials || "A"}
        </div>
      )}

      {/* Hologram Overlay Ring */}
      <span
        className="
          pointer-events-none absolute inset-0 rounded-3xl 
          ring-1 ring-emerald-500/30 
          shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]
        "
      />

      {/* Glow pulse ring */}
      <div
        className="
          pointer-events-none absolute inset-0
          rounded-3xl border border-emerald-400/20
          animate-pulse opacity-40
        "
      ></div>
    </figure>
  );
};

export default ProfileAvatar;
