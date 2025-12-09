// src/services/paypal.js
import { getEnv } from "../utils/env";

const API_BASE = getEnv("VITE_API_BASE", "http://localhost:5000/api");
const PAYPAL_CURRENCY = getEnv("VITE_PAYPAL_CURRENCY", "USD");

export const createPaypalOrder = async ({ amountEGP, reference }) => {
  const res = await fetch(`${API_BASE}/paypal/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountEGP,
      currency: PAYPAL_CURRENCY,
      reference,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to init PayPal order");
  }

  if (data?.paypalOrderId) {
    localStorage.setItem("lastPaypalOrderId", data.paypalOrderId);
  }

  return data; // { paypalOrderId, approvalUrl }
};

export const capturePaypalOrder = async ({ orderId, token, payerId }) => {
  const res = await fetch(`${API_BASE}/paypal/capture-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, token, payerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to capture PayPal order");

  return data; // { status, captureId, raw }
};

export const parsePaypalRedirect = (url = "") => {
  const lower = url.toLowerCase();
  const query = url.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const token = params.get("token");
  const payer = params.get("PayerID") || params.get("payer_id");

  if (lower.includes("cancel")) return { status: "cancel", token, payer };
  if (payer || lower.includes("success")) return { status: "success", token, payer };
  return { status: "pending", token, payer };
};
