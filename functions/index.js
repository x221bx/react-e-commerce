// functions/index.js
const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

/**
 * Notification doc shape:
 * {
 *   title: string,
 *   message: string,
 *   type: 'low_stock' | 'order_update' | 'order_new' | ...,
 *   read: boolean,
 *   createdAt: admin.firestore.FieldValue.serverTimestamp(),
 *   recipientId?: string,        // for user-specific notifications
 *   recipientRole?: 'admin'      // for admin-wide notifications
 * }
 */

// --- helper to write notification ---
async function createNotification(payload) {
  const docRef = await admin
    .firestore()
    .collection("notifications")
    .add({
      ...payload,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  logger.info("Notification created:", docRef.id, payload);
  return docRef.id;
}

// Example: low stock check - create notifications for admin when product.stock <= threshold
exports.checkLowStock = onRequest(async (req, res) => {
  try {
    const threshold = Number(req.query.threshold || 5);
    const snapshot = await admin.firestore().collection("products").get();

    const notifications = [];
    snapshot.forEach((doc) => {
      const p = doc.data();
      // require a stock field numeric
      if (typeof p.stock === "number" && p.stock <= threshold) {
        // create admin notification
        notifications.push({
          title: `Low stock: ${p.title || "Unnamed product"}`,
          message: `Product "${p.title || doc.id}" has low stock (${p.stock}).`,
          type: "low_stock",
          recipientRole: "admin",
          productId: doc.id,
        });
      }
    });

    // add notifications
    const adds = notifications.map((n) => createNotification(n));
    await Promise.all(adds);

    res.status(200).send({ created: notifications.length });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Auto-refill (example) - only if autoRefill flag set on product
exports.autoRefillStock = onRequest(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("products").get();
    const updates = [];
    snapshot.forEach((doc) => {
      const p = doc.data();
      if ((p.stock ?? 0) <= 0 && p.autoRefill) {
        updates.push(
          admin
            .firestore()
            .collection("products")
            .doc(doc.id)
            .update({ stock: p.refillAmount || 10 })
        );
      }
    });
    await Promise.all(updates);
    res.status(200).send({ updated: updates.length });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Order status update endpoint: updates order doc, creates notification for customer and admin
exports.orderStatusUpdate = onRequest(async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status)
      return res.status(400).send({ error: "Missing orderId or status" });

    const orderRef = admin.firestore().collection("orders").doc(orderId);
    await orderRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const orderSnap = await orderRef.get();
    const order = orderSnap.data();

    // Create customer notification
    if (order?.customerId) {
      await createNotification({
        title: `Order #${orderId} status: ${status}`,
        message: `Your order #${orderId} is now "${status}".`,
        type: "order_update",
        recipientId: order.customerId,
        orderId,
      });
    } else if (order?.customerEmail) {
      // Fallback: create an admin notification referencing email
      await createNotification({
        title: `Order #${orderId} updated`,
        message: `Order by ${order.customerEmail} updated to ${status}`,
        type: "order_update",
        recipientRole: "admin",
        orderId,
      });
    }

    // Also notify admin
    await createNotification({
      title: `Order #${orderId} updated`,
      message: `Order #${orderId} status changed to ${status}.`,
      type: "order_update",
      recipientRole: "admin",
      orderId,
    });

    res.status(200).send({ ok: true });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Create notification endpoint (generic)
exports.createNotification = onRequest(async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || (!payload.title && !payload.message)) {
      return res.status(400).send({ error: "Missing title/message" });
    }
    const id = await createNotification(payload);
    res.status(200).send({ id });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Mark notification read (http endpoint) - accepts { id, userId } and sets read=true
exports.markNotificationRead = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).send({ error: "Missing id" });

    const docRef = admin.firestore().collection("notifications").doc(id);
    await docRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(200).send({ ok: true });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err.message });
  }
});
