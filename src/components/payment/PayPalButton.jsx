// src/components/payment/PayPalButton.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPaypalOrder, capturePaypalOrder } from "../../services/paypal";

// Load PayPal SDK once; reuse if already present.
const loadPayPalSdk = (clientId, currency, onReady, onError) => {
  if (!clientId) {
    onError?.("Missing PayPal client ID");
    return;
  }

  if (typeof window === "undefined") return;

  if (window.paypal) {
    onReady?.();
    return;
  }

  const existing = document.querySelector(
    'script[src*="paypal.com/sdk/js"]'
  );
  if (existing) {
    existing.addEventListener("load", onReady);
    existing.addEventListener("error", () =>
      onError?.("Failed to load PayPal SDK")
    );
    return;
  }

  const script = document.createElement("script");
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
  script.async = true;
  script.onload = onReady;
  script.onerror = () => onError?.("Failed to load PayPal SDK");
  document.body.appendChild(script);
};

export default function PayPalButton({
  clientId,
  amount,
  currency = "USD",
  orderRef,
  onSuccess,
  onError,
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Load SDK
  useEffect(() => {
    setError(null);
    loadPayPalSdk(clientId, currency, () => setSdkReady(true), (msg) => {
      setError(msg);
      onError?.(msg);
    });
  }, [clientId, currency, onError]);

  // Render buttons when SDK is ready
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || !clientId) {
      return;
    }

    containerRef.current.innerHTML = "";
    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      // Create order on backend to keep currency/amount logic in one place.
      createOrder: async () => {
        try {
      const ref = orderRef || `WEB-${Date.now()}`;
      const session = await createPaypalOrder({
        amountEGP: amount,
        reference: ref,
      });
      const paypalOrderId = session?.paypalOrderId || session?.id;
      if (!paypalOrderId) {
        throw new Error("Missing PayPal order id from server");
      }
      return paypalOrderId;
        } catch (err) {
          const message =
            err?.message || "Failed to start PayPal checkout";
          setError(message);
          onError?.(message);
          throw err;
        }
      },
      // Capture order through backend
      onApprove: async (data) => {
        try {
          const capture = await capturePaypalOrder({
            orderId: data.orderID,
            token: data.orderID,
            payerId: data.payerID,
          });

          const details = {
            ...capture,
            orderId: data.orderID,
            payerId: data.payerID,
          };

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                status: "success",
                details,
              })
            );
          }

          onSuccess?.(details);
        } catch (err) {
          const message =
            err?.message || "Failed to capture PayPal order";
          setError(message);

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                status: "error",
                message,
              })
            );
          }

          onError?.(message);
        }
      },
      onError: (err) => {
        const message = err?.message || err?.toString?.() || "PayPal error";
        setError(message);

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              status: "error",
              message,
            })
          );
        }

        onError?.(message);
      },
    });

    buttons.render(containerRef.current).catch((err) => {
      const message = err?.message || "Failed to render PayPal buttons";
      setError(message);
      onError?.(message);
    });

    return () => {
      try {
        buttons.close?.();
      } catch (err) {
        // ignore
      }
    };
  }, [sdkReady, amount, currency, clientId, orderRef, onSuccess, onError]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {!sdkReady && !error && (
        <p className="text-sm text-slate-500">Loading PayPal...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
