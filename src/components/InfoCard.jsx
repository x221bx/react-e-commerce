const cardTypes = {
  notification: {
    bgColor: "bg-white/65",
    iconBg: null,
  },
  stat: {
    bgColor: "bg-white/65",
    iconBg: "#49BBBD",
    icon: "📅",
  },
  congratulations: {
    bgColor: "bg-white/70",
    iconBg: "#F88C3D",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28.9294 4.28577H1.07227L15.0008 15.7586L29.0869 4.31791C29.0353 4.30284 28.9827 4.29211 28.9294 4.28577Z"
          fill="white"
        />
        <path
          d="M15.676 17.9743C15.2813 18.2975 14.7133 18.2975 14.3186 17.9743L0 6.17786V24.6428C0 25.2346 0.479694 25.7143 1.07145 25.7143H28.9285C29.5203 25.7143 30 25.2346 30 24.6428V6.33644L15.676 17.9743Z"
          fill="white"
        />
      </svg>
    ),
  },
};

export default function InfoCard({
  type = "notification", // or "promo"
  image,
  icon,
  title,
  subtitle,
  buttonText,
  onClick,
  hasButton = false,
  className = "",
  bgColor,
  iconBg,
  promo = false, //  NEW: promo mode
  overlayColor = "bg-black/40",
  buttonBg = "bg-[#49BBBD]",
  buttonTextColor = "text-white",
}) {
  const settings = cardTypes[type] || {};
  const finalBg = bgColor || settings.bgColor;
  const finalIconBg = iconBg || settings.iconBg;
  const finalIcon = icon || settings.icon;

  //  Promo Mode (with background image)
  if (promo) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl shadow-md ${className}`}
      >
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div
          className={`absolute inset-0 ${overlayColor} flex flex-col items-center justify-center p-6 text-center`}
        >
          <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
          {buttonText && (
            <button
              onClick={onClick}
              className={`rounded-full px-6 py-2 text-sm font-semibold ${buttonBg} ${buttonTextColor} transition hover:opacity-40`}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    );
  }

  //    Default Mode
  return (
    <div
      className={`rounded-xl p-4 text-[#333] shadow-xl backdrop-blur-md ${finalBg} ${className}`}
    >
      <div className="flex items-center gap-3">
        {type === "notification" && image && (
          <img
            src={image}
            alt="User"
            className="h-11 w-11 rounded-full object-cover"
          />
        )}

        {type !== "notification" && finalIcon && (
          <div
            className="text-md flex h-10 w-10 items-center justify-center rounded-md text-white"
            style={{ backgroundColor: finalIconBg }}
          >
            {finalIcon}
          </div>
        )}

        <div>
          <p className="leading-none font-semibold">{title}</p>
          {subtitle && (
            <p className="mt-1 text-xs leading-none text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {hasButton && buttonText && (
        <button
          onClick={onClick}
          className="mt-3 rounded-full bg-pink-500 px-4 py-1 text-xs text-white"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
