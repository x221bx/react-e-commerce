// src/services/paymob.js
import { getEnv } from "../utils/env";

const API_BASE = getEnv("VITE_API_BASE", "/api");

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    // Return a structured object so callers can surface a meaningful error
    return {
      __raw: text,
      message:
        text?.slice(0, 140) ||
        `Unexpected response (status ${res.status || "?"})`,
    };
  }
}

export const parsePaymobRedirect = (url) => {
  if (!url) return { status: "unknown" };
  const parts = url.split("?");
  const query = parts[1] || "";
  const params = new URLSearchParams(query);
  const successFlag = params.get("success");
  const pendingFlag = params.get("pending");
  const txnCode = params.get("txn_response_code");
  const transactionId = params.get("id") || params.get("transaction_id");

  const successCodes = ["APPROVED", "00", "0"];
  const pendingCodes = ["10"];

  const isSuccess = successFlag === "true" || successCodes.includes(txnCode);
  const isPending = pendingFlag === "true" || pendingCodes.includes(txnCode);

  return {
    status: isSuccess ? "success" : isPending ? "pending" : "failed",
    txnCode,
    transactionId,
    rawUrl: url,
  };
};


export const createPaymobCardPayment = async ({
  amount,
  cartItems = [],
  form = {},
  user = {},
  merchantOrderId,
  integrationId,
  walletNumber,
  wallet = false,
}) => {
  const res = await fetch(`${API_BASE}/paymob/card-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      cartItems,
      form,
      user,
      merchantOrderId,
      integrationId,
      walletNumber,
      wallet,
    }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.message || "Failed to initialize Paymob payment");
  }

  return data; // { paymentUrl, paymentKey, paymobOrderId, amountCents }
};

export const createPaymobWalletPayment = async ({
  amount,
  cartItems = [],
  form = {},
  user = {},
  merchantOrderId,
  walletNumber,
}) => {
  const res = await fetch(`${API_BASE}/paymob/wallet-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      cartItems,
      form,
      user,
      merchantOrderId,
      walletNumber,
    }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.message || "Failed to initialize Paymob wallet payment");
  }

  return data; // { paymentUrl, paymentKey, paymobOrderId, amountCents, wallet: true }
};
