// src/services/ordersService.js
import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

const ordersCollection = collection(db, "orders");

const sanitizeItems = (items = []) =>
  items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const image =
      item.thumbnailUrl || item.imageUrl || item.image || item.img || "";
    const productId =
      item.id ||
      item.productId ||
      `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stockKey = item.productId || item.id;
    return {
      productId,
      id: productId,
      name: item.name || item.title || "Item",
      category: item.category || item.type || "General",
      price,
      quantity,
      total: Number((quantity * price).toFixed(2)),
      image,
      imageUrl: image,
      stockKey,
    };
  });

const buildReference = () => {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(2, 12);
  return `AGRI-${stamp}`;
};

const buildOrderNumber = () => {
  const segment = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${segment}${random}`;
};

const updateInventoryCounts = async (items) => {
  if (!items.length) return;
  for (const item of items) {
    const pid = item.stockKey || item.productId || item.id;
    if (!pid) continue;
    const qty = Math.abs(Number(item.quantity || 0));
    if (!qty) continue;

    const productRef = doc(db, "products", pid);
    const snap = await getDoc(productRef);
    if (!snap.exists()) continue;

    const current = snap.data() || {};
    const currentStock = Number(current.stock ?? current.quantity ?? 0) || 0;
    const nextStock = Math.max(0, currentStock - qty);

    const batch = writeBatch(db);
    batch.update(productRef, {
      stock: nextStock,
      quantity: nextStock,
    });
    await batch.commit();
  }
};

export const createOrder = async ({
  uid,
  userId,
  userEmail,
  userName,
  shipping,
  paymentMethod,
  paymentSummary,
  paymentDetails = null,
  totals,
  items = [],
  notes = "",
}) => {
  const resolvedUid = uid || userId;
  if (!resolvedUid) throw new Error("User is required to place an order");
  if (!items.length) throw new Error("Cannot place an order without items");

  const normalizedItems = sanitizeItems(items);
  const statusHistory = [
    { status: "Pending", changedAt: new Date().toISOString() },
  ];

  const payload = {
    reference: buildReference(),
    orderNumber: buildOrderNumber(),
    uid: resolvedUid,
    userId: resolvedUid,
    userEmail,
    userName,
    fullName: shipping?.fullName || userName,
    phone: shipping?.phone || "",
    address: shipping?.addressLine1 || "",
    city: shipping?.city || "",
    notes,
    shipping: {
      ...shipping,
      recipient: shipping?.fullName || userName,
      trackingNumber: shipping?.trackingNumber || "",
    },
    paymentMethod,
    paymentSummary: paymentSummary || paymentMethod,
    paymentDetails: paymentDetails || null,
    totals,
    total: totals?.total ?? 0,
    items: normalizedItems,
    status: "Pending",
    statusHistory,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersCollection, payload);
  try {
    await updateInventoryCounts(normalizedItems);
  } catch (inventoryError) {
    console.error("Inventory update failed", inventoryError);
  }

  return { id: docRef.id, reference: payload.reference };
};

export const getOrderById = async (orderId) => {
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) {
    throw new Error("Order not found");
  }

  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null,
  };
};

export const getUserOrdersQuery = (userId) => {
  if (!userId) return null;
  return query(
    ordersCollection,
    where("uid", "==", userId),
    orderBy("createdAt", "desc")
  );
};
