// src/components/ui/Spinner.jsx
export default function Spinner({ size = 24, color = "blue-500", thickness = 4, className = "" }) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* الخلفية الدائرية الشفافة */}
      <div
        className={`absolute inset-0 rounded-full border-${thickness} border-gray-200`}
        style={{ borderWidth: thickness }}
      ></div>

      {/* الجزء الدوار مع تأثير glow */}
      <div
        className={`animate-spin rounded-full border-${thickness} border-t-${color} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
        style={{ width: size, height: size, borderWidth: thickness }}
      ></div>
    </div>
  );
}
