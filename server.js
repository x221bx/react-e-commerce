import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import crypto from "crypto";

dotenv.config();

const app = express();
// Optional CORS allowlist via ALLOWED_ORIGINS="https://a.com,https://b.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin:
      allowedOrigins.length === 0
        ? true
        : (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error("Not allowed by CORS"));
          },
  })
);
app.use(express.json({ limit: "1mb" }));

const {
  PORT = 5000,
  PAYMOB_API_BASE,
  PAYMOB_API_KEY,
  PAYMOB_IFRAME_ID,
  PAYMOB_WALLET_IFRAME_ID,
  PAYMOB_CARD_INTEGRATION_ID,
  PAYMOB_WALLET_INTEGRATION_ID,
  PAYMOB_HMAC,
  PAYPAL_BASE,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_CURRENCY,
  PAYPAL_RETURN_URL,
  PAYPAL_CANCEL_URL,
  PAYPAL_EGP_TO_USD_RATE,
} = process.env;

const jsonHeaders = { "Content-Type": "application/json" };

// Ensure we never charge less than the cart total if items are provided
function calculateAmountCents({ amount, cartItems = [] }) {
  const cartTotalCents = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) =>
          sum + Math.max(0, Math.round(Number(item.price || 0) * 100)) * Number(item.quantity || 1),
        0
      )
    : 0;

  const requested = Math.round(Number(amount || 0) * 100);
  const base = cartTotalCents > 0 ? cartTotalCents : requested;
  return Math.max(100, base); // minimum 1 EGP
}

// ================ Helpers ================
async function paymobRequest(path, payload) {
  const res = await fetch(`${PAYMOB_API_BASE}${path}`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error_msg ||
      `Paymob request failed (${res.status})`;
    const err = new Error(message);
    err.payload = data;
    throw err;
  }
  return data;
}

async function paypalRequest(path, { method = "GET", headers = {}, body, token } = {}) {
  const finalHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  console.log("PayPal Request Details:", {
    url: `${PAYPAL_BASE}${path}`,
    method,
    headers: finalHeaders,
    bodyLength: body ? body.length : 0,
    bodyContent: body ? body.substring(0, 200) : "none",
  });
  
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body,
  });

  const data = await res.json().catch(() => ({}));
  
  console.log("PayPal Response:", {
    url: `${PAYPAL_BASE}${path}`,
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    dataKeys: Object.keys(data).slice(0, 5),
  });
  
  if (!res.ok) {
    const message =
      data?.message ||
      data?.name ||
      data?.error_description ||
      `PayPal request failed (${res.status})`;
    const err = new Error(message);
    err.payload = data;
    throw err;
  }
  return data;
}

async function getPaypalAccessToken() {
  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" }).toString();

  const data = await paypalRequest("/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return data?.access_token;
}

function convertEgpToUsd(amountEgp) {
  const rate = Number(PAYPAL_EGP_TO_USD_RATE || 0);
  if (!rate || rate <= 0) throw new Error("PAYPAL_EGP_TO_USD_RATE is not configured or invalid");
  return Number((Number(amountEgp || 0) * rate).toFixed(2));
}

// Simple in-memory order store placeholder (replace with DB)
const orders = new Map();

function saveOrderDraft({ reference, amountCents, provider, meta = {} }) {
  const id = reference || `draft-${Date.now()}`;
  orders.set(id, { id, amountCents, provider, status: "pending", meta });
  return id;
}

function updateOrderStatus(id, status, payload = {}) {
  if (!orders.has(id)) return;
  const current = orders.get(id);
  orders.set(id, { ...current, status, payload, updatedAt: Date.now() });
}

function computePaymobHmac(body = {}) {
  const src = [
    body.amount_cents ?? "",
    body.created_at ?? "",
    body.currency ?? "",
    body.error_occured ?? "",
    body.has_parent_transaction ?? "",
    body.id ?? "",
    body.integration_id ?? "",
    body.is_3d_secure ?? "",
    body.is_auth ?? "",
    body.is_capture ?? "",
    body.is_refunded ?? "",
    body.is_standalone_payment ?? "",
    body.is_voided ?? "",
    body.order?.id ?? "",
    body.owner ?? "",
    body.pending ?? "",
    body.source_data?.pan ?? "",
    body.source_data?.sub_type ?? "",
    body.source_data?.type ?? "",
    body.success ?? "",
  ]
    .map((v) => `${v}`)
    .join("");

  return crypto.createHmac("sha512", PAYMOB_HMAC || "").update(src).digest("hex");
}

// ================ Paymob API ================
app.post("/api/paymob/card-payment", async (req, res) => {
  try {
    const {
      amount,
      currency = "EGP",
      cartItems = [],
      form = {},
      user = {},
      merchantOrderId,
      integrationId, // allow wallet/card switching from frontend
      walletNumber,
      wallet = false,
    } = req.body;

    const amountCents = calculateAmountCents({ amount, cartItems });
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const auth = await paymobRequest("/auth/tokens", { api_key: PAYMOB_API_KEY });
    const authToken = auth?.token;
    if (!authToken) throw new Error("Failed to obtain Paymob auth token");

    const order = await paymobRequest("/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amountCents,
      currency,
      items:
        Array.isArray(cartItems) && cartItems.length
          ? cartItems.map((item) => ({
              name: item.name || item.title || "Item",
              amount_cents: Math.round(Number(item.price || 0) * 100),
              description: item.description || item.name || "Cart item",
              quantity: Number(item.quantity || 1),
            }))
          : [
              {
                name: "Order",
                amount_cents: amountCents,
                description: "Cart order",
                quantity: 1,
              },
            ],
      merchant_order_id: merchantOrderId,
    });

    const fullName = (form.fullName || user?.displayName || "Guest User").trim();
    const [firstName = "Guest", ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(" ") || "User";

    const walletDigits = (walletNumber || form.walletNumber || form.phone || "")
      .toString()
      .replace(/\D/g, "")
      .slice(0, 11);
    if (wallet && (!walletDigits || walletDigits.length < 10)) {
      throw new Error("Wallet number is required for wallet payments");
    }

    const billing_data = {
      first_name: firstName,
      last_name: lastName,
      email: user?.email || "unknown@example.com",
      phone_number:
        wallet && walletDigits
          ? `+2${walletDigits}`
          : form.phone || "+201000000000",
      apartment: "NA",
      floor: "NA",
      street: form.address || "NA",
      building: "NA",
      shipping_method: "PKG",
      postal_code: "00000",
      city: form.city || "Cairo",
      state: form.city || "NA",
      country: "EG",
    };

    const walletIntegrationId =
      integrationId ||
      PAYMOB_WALLET_INTEGRATION_ID ||
      process.env.PAYMOB_WALLET_INTEGRATION_ID;
    const cardIntegrationId =
      PAYMOB_CARD_INTEGRATION_ID || process.env.PAYMOB_CARD_INTEGRATION_ID;

    const integrationToUse = wallet
      ? walletIntegrationId
      : integrationId || cardIntegrationId;

    if (!integrationToUse) {
      const hint = wallet ? "PAYMOB_WALLET_INTEGRATION_ID" : "PAYMOB_CARD_INTEGRATION_ID";
      throw new Error(`Missing Paymob integration id. Please set ${hint}.`);
    }

    const payment = await paymobRequest("/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: amountCents,
      currency,
      order_id: order?.id,
      integration_id: Number(integrationToUse),
      billing_data,
      lock_order_when_paid: true,
    });

    if (wallet) {
      // Wallet flow requires an extra pay call to get a redirect URL, not the card iframe
      const walletPay = await paymobRequest("/acceptance/payments/pay", {
        source: {
          identifier: walletDigits,
          subtype: "WALLET",
        },
        payment_token: payment?.token,
      });

      const walletRedirect =
        walletPay?.redirect_url ||
        walletPay?.redirection_url ||
        walletPay?.iframe_redirection_url;

      if (!walletRedirect) {
        throw new Error("Failed to obtain Paymob wallet redirect URL");
      }

      return res.json({
        paymentUrl: walletRedirect,
        paymentKey: payment?.token,
        paymobOrderId: order?.id,
        amountCents,
        wallet: true,
      });
    }

    const iframeId = PAYMOB_IFRAME_ID;
    if (!iframeId) {
      throw new Error("PAYMOB_IFRAME_ID is not configured");
    }

    const paymentUrl = `${PAYMOB_API_BASE}/acceptance/iframes/${iframeId}?payment_token=${payment?.token}`;

    const reference = merchantOrderId || `paymob-${order?.id}`;

    saveOrderDraft({
      reference,
      amountCents,
      provider: wallet ? "paymob_wallet" : "paymob_card",
      meta: { paymobOrderId: order?.id },
    });

    res.json({
      reference,
      paymentUrl,
      paymentKey: payment?.token,
      paymobOrderId: order?.id,
      amountCents,
    });
  } catch (err) {
    console.error("Paymob error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

// Dedicated wallet endpoint (closer to the native flow)
app.post("/api/paymob/wallet-payment", async (req, res) => {
  try {
    const {
      amount,
      currency = "EGP",
      cartItems = [],
      form = {},
      user = {},
      merchantOrderId,
      walletNumber,
    } = req.body;

    const walletDigits = (walletNumber || form.walletNumber || form.phone || "")
      .toString()
      .replace(/\D/g, "")
      .slice(0, 11);

    if (!walletDigits || walletDigits.length < 10) {
      return res.status(400).json({ message: "Wallet number is required" });
    }

    const amountCents = Math.max(100, Math.round(Number(amount || 0) * 100));

    const auth = await paymobRequest("/auth/tokens", { api_key: PAYMOB_API_KEY });
    const authToken = auth?.token;
    if (!authToken) throw new Error("Failed to obtain Paymob auth token");

    const order = await paymobRequest("/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amountCents,
      currency,
      items:
        Array.isArray(cartItems) && cartItems.length
          ? cartItems.map((item) => ({
              name: item.name || item.title || "Item",
              amount_cents: Math.round(Number(item.price || 0) * 100),
              description: item.description || item.name || "Cart item",
              quantity: Number(item.quantity || 1),
            }))
          : [
              {
                name: "Order",
                amount_cents: amountCents,
                description: "Cart order",
                quantity: 1,
              },
            ],
      merchant_order_id: merchantOrderId,
    });

    const fullName = (form.fullName || user?.displayName || "Guest User").trim();
    const [firstName = "Guest", ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(" ") || "User";

    const walletIntegrationId = PAYMOB_WALLET_INTEGRATION_ID || process.env.PAYMOB_WALLET_INTEGRATION_ID;
    if (!walletIntegrationId) {
      throw new Error("PAYMOB_WALLET_INTEGRATION_ID is not configured");
    }

    const billing_data = {
      first_name: firstName,
      last_name: lastName,
      email: user?.email || "unknown@example.com",
      phone_number: `+2${walletDigits}`,
      apartment: "NA",
      floor: "NA",
      street: form.address || "NA",
      building: "NA",
      shipping_method: "PKG",
      postal_code: "00000",
      city: form.city || "Cairo",
      state: form.city || "NA",
      country: "EG",
    };

    const payment = await paymobRequest("/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: amountCents,
      currency,
      order_id: order?.id,
      integration_id: Number(walletIntegrationId),
      billing_data,
      lock_order_when_paid: true,
    });

    const walletPay = await paymobRequest("/acceptance/payments/pay", {
      source: {
        identifier: walletDigits,
        subtype: "WALLET",
      },
      payment_token: payment?.token,
    });

    const walletRedirect =
      walletPay?.redirect_url ||
      walletPay?.redirection_url ||
      walletPay?.iframe_redirection_url;

    if (!walletRedirect) {
      throw new Error("Failed to obtain Paymob wallet redirect URL");
    }

    const reference = merchantOrderId || `paymob-${order?.id}`;

    saveOrderDraft({
      reference,
      amountCents,
      provider: "paymob_wallet",
      meta: { paymobOrderId: order?.id },
    });

    res.json({
      reference,
      paymentUrl: walletRedirect,
      paymentKey: payment?.token,
      paymobOrderId: order?.id,
      amountCents,
      wallet: true,
    });
  } catch (err) {
    console.error("Paymob wallet error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

// Paymob webhook to receive transaction status
app.post("/api/paymob/webhook", (req, res) => {
  try {
    if (!PAYMOB_HMAC) {
      return res.status(500).json({ message: "PAYMOB_HMAC is not configured" });
    }

    const body = req.body || {};
    const sentHmac = (body.hmac || "").toLowerCase();
    const computed = computePaymobHmac(body);

    if (!sentHmac || sentHmac !== computed) {
      return res.status(400).json({ message: "Invalid HMAC" });
    }

    const status = body.success ? "paid" : body.pending ? "pending" : "failed";
    const txnId = body.id;
    const paymobOrderId = body.order?.id;

    console.log("Paymob webhook:", {
      status,
      txnId,
      paymobOrderId,
      amount: body.amount_cents,
      integration: body.integration_id,
    });

    // TODO: update your local order in DB using paymobOrderId / merchant_order_id
    // Example stub: updateOrderStatus(paymobOrderId, status, body);

    res.json({ ok: true });
  } catch (err) {
    console.error("Paymob webhook error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

// ================ PayPal API ================
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { amount, reference, cartItems = [] } = req.body;

    // ✅ التحقق من المبلغ
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount. Must be greater than 0");
    }

    const amountCents = calculateAmountCents({ amount, cartItems });
    const amountEgp = amountCents / 100;
    const amountUsd = convertEgpToUsd(amountEgp); // ≥ 1 USD

    const accessToken = await getPaypalAccessToken();

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: reference || `ref-${Date.now()}`,
          amount: {
            value: amountUsd.toFixed(2), // نصيحة: "XX.XX" format
            currency_code: "USD",
          },
        },
      ],
      application_context: {
        return_url: PAYPAL_RETURN_URL,
        cancel_url: PAYPAL_CANCEL_URL,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    };

    const order = await paypalRequest("/v2/checkout/orders", {
      method: "POST",
      token: accessToken,
      headers: jsonHeaders,
      body: JSON.stringify(orderBody),
    });

    if (!order || !order.id) {
      throw new Error("PayPal order not created properly");
    }

    // حفظ الـ draft محليًا
    const draftId = saveOrderDraft({
      reference: reference || order.id,
      amountCents,
      provider: "paypal",
      meta: { paypalOrderId: order.id },
    });

    const approvalLink = order.links.find((l) => l.rel === "approve")?.href;

    if (!approvalLink) {
      throw new Error("PayPal approval link missing");
    }

    res.json({
      paypalOrderId: order.id,
      approvalUrl: approvalLink,
      reference: draftId,
    });
  } catch (err) {
    console.error("PayPal create error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { orderId, reference } = req.body;

    if (!orderId) throw new Error("Missing orderId for capture");

    const accessToken = await getPaypalAccessToken();

    // ✅ جلب حالة الطلب أولًا
    const order = await paypalRequest(`/v2/checkout/orders/${orderId}`, {
      method: "GET",
      token: accessToken,
    });

    console.log("PayPal order status before capture:", order.status);
    if (!order || !order.id) throw new Error("PayPal order not found");

    // باي بال يقبل فقط orders في حالة APPROVED أو CREATED للـ capture
    if (!["APPROVED", "CREATED"].includes(order.status)) {
      throw new Error(`Order not ready for capture: ${order.status}`);
    }

    // ✅ تنفيذ الـ capture
    const capture = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({}), // body فارغ
    });

    const status = capture.status || "UNKNOWN";
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    // تحديث حالة الـ draft
    if (reference) {
      updateOrderStatus(reference, status?.toLowerCase?.() || status, {
        captureId,
        raw: capture,
      });
    }

    res.json({ status, captureId, raw: capture });
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
