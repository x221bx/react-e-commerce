// src/services/paymob.js
import { getEnv } from "../utils/env";

const API_BASE = getEnv("VITE_API_BASE", "http://localhost:5000/api");

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

  const isSuccess = successFlag === "true" && successCodes.includes(txnCode);
  const isPending = pendingCodes.includes(txnCode);
  const isFailed = !isSuccess && !isPending;

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
}) => {
  const res = await fetch(`${API_BASE}/paymob/card-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, cartItems, form, user, merchantOrderId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to initialize Paymob payment");
  }

  return data; // { paymentUrl, paymentKey, paymobOrderId, amountCents }
};
