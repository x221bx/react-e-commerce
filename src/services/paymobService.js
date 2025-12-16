const PAYMOB_SERVER_URL = (import.meta.env.VITE_PAYMOB_SERVER_URL || "").replace(/\/+$/, "");
const baseUrl = PAYMOB_SERVER_URL || "";

const buildUrl = (endpoint) => {
  if (!endpoint.startsWith("/")) return `${baseUrl}/${endpoint}`;
  return `${baseUrl}${endpoint}`;
};

const callPaymobEndpoint = async (endpoint, payload) => {
  const url = buildUrl(endpoint);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.message || data?.error || "Paymob service could not process the request.";
    throw new Error(message);
  }

  return data;
};

export const createPaymobSession = (payload) =>
  callPaymobEndpoint("/api/paymob/session", payload);

export const isPaymobReady = () => !!PAYMOB_SERVER_URL;

export const getPaymobServerUrl = () => PAYMOB_SERVER_URL || "/";
