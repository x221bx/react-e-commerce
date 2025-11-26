import React from "react";

const LoadingSpinner = ({
  size = "md",
  className = "",
  text = "Loading..."
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-2`}></div>
      {text && <p className="text-sm text-[var(--text-muted)]">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;