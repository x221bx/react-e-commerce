// server.js في روت المشروع
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // لو Node 18+ تقدر تشيله وتستخدم global.fetch

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  PORT = 5000,
  PAYMOB_API_BASE,
  PAYMOB_API_KEY,
  PAYMOB_IFRAME_ID,
  PAYMOB_CARD_INTEGRATION_ID,
  PAYPAL_BASE,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_CURRENCY,
  PAYPAL_RETURN_URL,
  PAYPAL_CANCEL_URL,
} = process.env;

const jsonHeaders = { "Content-Type": "application/json" };

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

// ================ Paymob API ================
app.post("/api/paymob/card-payment", async (req, res) => {
  try {
    const { amount, currency = "EGP", cartItems = [], form = {}, user = {}, merchantOrderId } =
      req.body;

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

    const billing_data = {
      first_name: firstName,
      last_name: lastName,
      email: user?.email || "unknown@example.com",
      phone_number: form.phone || "+201000000000",
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
      integration_id: Number(PAYMOB_CARD_INTEGRATION_ID),
      billing_data,
      lock_order_when_paid: true,
    });

    const paymentUrl = `${PAYMOB_API_BASE}/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${payment?.token}`;

    res.json({
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

// ================ PayPal API ================
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { amount, currency = PAYPAL_CURRENCY, reference } = req.body;

    const accessToken = await getPaypalAccessToken();

    const body = JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: reference,
          amount: {
            value: Number(amount || 0).toFixed(2),
            currency_code: currency,
          },
        },
      ],
      application_context: {
        return_url: PAYPAL_RETURN_URL,
        cancel_url: PAYPAL_CANCEL_URL,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    });

    const order = await paypalRequest("/v2/checkout/orders", {
      method: "POST",
      headers: { ...jsonHeaders },
      token: accessToken,
      body,
    });

    const approvalLink = order?.links?.find?.((l) => l.rel === "approve")?.href;

    res.json({
      paypalOrderId: order?.id,
      approvalUrl: approvalLink,
    });
  } catch (err) {
    console.error("PayPal create error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { orderId, token, payerId } = req.body;
    if (!orderId) throw new Error("Missing order id");
    if (!token || !payerId) throw new Error("Missing token or payerId");

    const accessToken = await getPaypalAccessToken();

    const capture = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: { ...jsonHeaders },
      token: accessToken,
      body: JSON.stringify({
        payment_source: {
          paypal: {
            token,
            payer_id: payerId,
          },
        },
      }),
    });

    const status = capture?.status;
    const captureId =
      capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      capture?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id;

    res.json({ status, captureId, raw: capture });
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.status(400).json({ message: err.message, payload: err.payload });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
