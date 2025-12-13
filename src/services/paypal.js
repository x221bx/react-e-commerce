// src/services/paypal.js
import { getEnv } from "../utils/env";

const API_BASE = getEnv("VITE_API_BASE", "/api");
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
    console.error("PayPal API error:", res.status, data);
    throw new Error(data?.message || data?.error || "Failed to init PayPal order");
  }

  if (data?.paypalOrderId) {
    localStorage.setItem("lastPaypalOrderId", data.paypalOrderId);
  }

  return data; // { paypalOrderId, approvalUrl, reference }
};

export const capturePaypalOrder = async ({ orderId, reference }) => {
  // PayPal v2 capture only needs the order ID
  const res = await fetch(`${API_BASE}/paypal/capture-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, reference }),
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
  const status = params.get("status"); // success | cancel
  
  // Check status parameter first (from URL)
  if (status === "cancel") return { status: "cancel", token, payer };
  if (status === "success" && payer) return { status: "success", token, payer };
  
  // Fallback to URL pattern matching
  if (lower.includes("cancel")) return { status: "cancel", token, payer };
  if (payer || lower.includes("success")) return { status: "success", token, payer };
  
  return { status: "pending", token, payer };
};
