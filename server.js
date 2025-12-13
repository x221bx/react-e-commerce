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
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
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
    const { amount, currency = PAYPAL_CURRENCY, reference, cartItems = [] } = req.body;

    const rate = Number(PAYPAL_EGP_TO_USD_RATE || 0);
    if (!rate || rate <= 0) {
      throw new Error("PAYPAL_EGP_TO_USD_RATE is not configured or invalid. Current value: " + PAYPAL_EGP_TO_USD_RATE);
    }
    
    // Validate that the conversion rate is reasonable (1 USD = ~30-40 EGP typically)
    // So the rate should be around 0.025 to 0.033 (1/40 to 1/30)
    if (rate < 0.01 || rate > 0.1) {
      throw new Error("PAYPAL_EGP_TO_USD_RATE is out of reasonable range. Expected ~0.025-0.033, got: " + rate);
    }
    
    const amountCents = calculateAmountCents({ amount, cartItems });
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new Error("Invalid amount");
    }
    
    // Ensure minimum amount for PayPal (at least 1 USD after conversion)
    const amountEgp = amountCents / 100;
    const amountUsd = convertEgpToUsd(amountEgp);
    
    if (amountUsd < 1.00) {
      throw new Error(`Amount too small for PayPal. Minimum 1 USD required. Current amount: ${amountUsd.toFixed(2)} USD (${amountEgp.toFixed(2)} EGP)`);
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      throw new Error("PayPal credentials are not configured");
    }

    const accessToken = await getPaypalAccessToken();
   
    if (!accessToken) {
      throw new Error("Failed to obtain PayPal access token. Check your PAYPAL_CLIENT_ID and PAYPAL_SECRET credentials.");
    }
  
    console.log("PayPal access token obtained successfully");
  
    // Ensure amount is valid for PayPal
    if (amountUsd <= 0) {
      throw new Error("Invalid amount: USD amount must be greater than 0");
    }
  
    // Validate PayPal configuration
    if (!PAYPAL_RETURN_URL || !PAYPAL_CANCEL_URL) {
      throw new Error("PayPal return and cancel URLs are not configured");
    }
  
    console.log("Creating PayPal order with:", {
      amountCents,
      amountEgp: amountEgp.toFixed(2),
      amountUsd: amountUsd.toFixed(2),
      currency: "USD",
      reference,
      returnUrl: PAYPAL_RETURN_URL,
      cancelUrl: PAYPAL_CANCEL_URL,
      clientId: PAYPAL_CLIENT_ID,
      environment: PAYPAL_BASE,
      conversionRate: PAYPAL_EGP_TO_USD_RATE,
      cartItems: cartItems.length,
    });
  
    // Log shipping information if included
    if (cartItems.length > 0) {
      const shippingCostEgp = amountCents / 100 - (amountCents / 100 - (amountCents / 100) / (1 / PAYPAL_EGP_TO_USD_RATE));
      const shippingCostUsd = convertEgpToUsd(shippingCostEgp);
      console.log("Shipping cost breakdown:", {
        totalAmountEgp: amountEgp.toFixed(2),
        totalAmountUsd: amountUsd.toFixed(2),
        shippingCostEgp: shippingCostEgp.toFixed(2),
        shippingCostUsd: shippingCostUsd.toFixed(2),
      });
    }
  
    // Additional validation for PayPal sandbox
    if (PAYPAL_BASE.includes("sandbox")) {
      console.log("WARNING: Using PayPal SANDBOX environment. Ensure:");
      console.log("1. Sandbox business account is properly funded");
      console.log("2. Return URLs are configured in PayPal Developer Dashboard");
      console.log("3. Using sandbox test accounts (not real accounts)");
    }
  
    const body = JSON.stringify({
      intent: "AUTHORIZE", // Use AUTHORIZE first, then capture with auth ID
      purchase_units: [
        {
          reference_id: reference,
          description: "Farm-Vet E-Shop Purchase",
          custom_id: reference,
          amount: {
            value: amountUsd.toFixed(2),
            currency_code: "USD",
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: amountUsd.toFixed(2),
              },
            },
          },
          items: [
            {
              name: "Farm-Vet Products",
              unit_amount: {
                currency_code: "USD",
                value: amountUsd.toFixed(2),
              },
              quantity: "1",
              category: "PHYSICAL_GOODS",
            },
          ],
        },
      ],
      application_context: {
        return_url: PAYPAL_RETURN_URL,
        cancel_url: PAYPAL_CANCEL_URL,
        user_action: "CONTINUE", // Changed to CONTINUE for better UX
        shipping_preference: "NO_SHIPPING",
        brand_name: "Farm-Vet E-Shop",
      },
    });
  
    try {
      const order = await paypalRequest("/v2/checkout/orders", {
        method: "POST",
        headers: { ...jsonHeaders },
        token: accessToken,
        body,
      });
  
      console.log("PayPal order created:", { orderId: order?.id, status: order?.status });
  
      const draftId = saveOrderDraft({
        reference: reference || order?.id,
        amountCents,
        provider: "paypal",
        meta: { paypalOrderId: order?.id },
      });
  
      const approvalLink = order?.links?.find?.((l) => l.rel === "approve")?.href;
  
      res.json({
        paypalOrderId: order?.id,
        approvalUrl: approvalLink,
        reference: draftId,
      });
    } catch (err) {
      console.error("PayPal create order error details:", {
        error: err.message,
        amountCents,
        amountEgp: amountEgp.toFixed(2),
        amountUsd: amountUsd.toFixed(2),
      });
      
      // Log detailed PayPal error information
      if (err.payload?.details) {
        console.error("PayPal validation errors:");
        err.payload.details.forEach((detail, index) => {
          console.error(`  [${index}] Issue: ${detail.issue || 'N/A'}`);
          console.error(`     Field: ${detail.field || 'N/A'}`);
          console.error(`     Description: ${detail.description || 'N/A'}`);
        });
      }
      
      throw err;
    }
  } catch (err) {
    console.error("PayPal create error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { orderId, reference } = req.body;
    if (!orderId) throw new Error("Missing order id");

    const accessToken = await getPaypalAccessToken();

    console.log("PayPal capture request", { orderId, reference });
    
    // First, check if the order is approved before attempting capture
    const order = await paypalRequest(`/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: { ...jsonHeaders },
      token: accessToken,
    });
    
    if (order?.status !== "APPROVED") {
      // Log order details for debugging
      console.warn("Order status check:", {
        status: order?.status,
        expected: "APPROVED",
        orderId,
        purchaseUnits: order?.purchase_units,
      });
      
      // For AUTHORIZE intent, we may need to capture from authorization
      if (order?.status === "APPROVED" || order?.purchase_units?.[0]?.payments?.authorizations?.length > 0) {
        console.log("Order found with authorization, proceeding to capture");
      } else {
        return res.status(409).json({
          message: `Order is not approved yet (status=${order?.status}). Please complete the payment approval in PayPal.`,
          orderStatus: order?.status,
          orderId,
          debug: "Try completing the payment approval step in PayPal",
        });
      }
    }
    
    console.log("Order status verified, proceeding with capture");
    
    // PayPal v2 capture endpoint requires an empty JSON body
    const capture = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: { ...jsonHeaders },
      token: accessToken,
      body: JSON.stringify({}), // Empty body is required for PayPal v2 API
    });

    const status = capture?.status;
    const captureId =
      capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      capture?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id;

    if (reference) {
      updateOrderStatus(reference, status?.toLowerCase?.() || status, {
        captureId,
        raw: capture,
      });
    }

    console.log("PayPal capture response", { status, captureId, details: capture?.details, raw: capture });

    res.json({ status, captureId, raw: capture });
  } catch (err) {
    console.error("PayPal capture error:", err);
    console.log("PAYPAL DEBUG_ID:", err?.payload?.debug_id);
    console.dir(err?.payload, { depth: null });
    
    // Handle COMPLIANCE_VIOLATION specifically
    if (err?.payload?.details?.[0]?.issue === "COMPLIANCE_VIOLATION") {
      return res.status(400).json({
        message: "PayPal Sandbox account needs activation. Please:\n1. Go to https://developer.paypal.com/dashboard\n2. Verify your Sandbox business account\n3. Enable Instant Payments for this account\n4. Or use a different test account",
        issue: "COMPLIANCE_VIOLATION",
        debugId: err?.payload?.debug_id,
      });
    }
    
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
