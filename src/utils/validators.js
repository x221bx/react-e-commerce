// Simple validators shared across the app
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Basic, permissive email validation suitable for client-side checks
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidEgyptianMobile(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, "");
  return /^01(0|1|2|5)\d{8}$/.test(digits);
}
