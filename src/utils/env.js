// src/utils/env.js
export const getEnv = (key, fallback) => {
  const value = import.meta.env[key];
  return value ?? fallback;
};
