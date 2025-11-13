export function formatPrice(
  value,
  currency,
  locale = document.documentElement.lang || "en",
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      currencyDisplay: "code",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `${Number(value || 0).toLocaleString()} ${currency || "USD"}`;
  }
}

export function formatDate(ts, locale = document.documentElement.lang || "en") {
  if (!ts) return "—";
  const ms = ts?.toMillis
    ? ts.toMillis()
    : ts?.seconds
      ? ts.seconds * 1000
      : +new Date(ts);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(ms);
}
