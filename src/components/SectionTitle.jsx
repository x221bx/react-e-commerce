export default function SectionTitle({
  title,
  highlight,
  align = "center",
  highlightColor = "#00CBB8",
  size = "text-3xl md:text-4xl",
}) {
  const alignClass = align === "left" ? "text-left" : "text-center";

  return (
    <h2 className={`mb-6 ${alignClass} font-bold ${size} text-gray-900`}>
      <span className="relative z-10">
        {title}
        <span style={{ color: highlightColor }}> {highlight}</span>
      </span>
    </h2>
  );
}
