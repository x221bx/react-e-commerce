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
  items.map((item) => ({
    id: item.id,
    name: item.name || item.title || "Item",
    price: Number(item.price) || 0,
    quantity: item.quantity || 1,
    image: item.thumbnailUrl || item.img || "",
  }));

const buildReference = () => {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(2, 12);
  return `AGRI-${stamp}`;
};

const updateInventoryCounts = async (items) => {
  const batch = writeBatch(db);
  items.forEach((item) => {
    if (!item.id) return;
    const productRef = doc(db, "products", item.id);
    batch.update(productRef, {
      quantity: increment(-(item.quantity || 1)),
    });
  });
  await batch.commit();
};

export const createOrder = async ({
  userId,
  userEmail,
  userName,
  shipping,
  paymentMethod,
  totals,
  items = [],
}) => {
  if (!userId) throw new Error("User is required to place an order");
  if (!items.length) throw new Error("Cannot place an order without items");

  const normalizedItems = sanitizeItems(items);
  const payload = {
    reference: buildReference(),
    userId,
    userEmail,
    userName,
    shipping,
    paymentMethod,
    totals,
    items: normalizedItems,
    status: "processing",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersCollection, payload);
  try {
    await updateInventoryCounts(normalizedItems);
  } catch (inventoryError) {
    console.error("Inventory update failed", inventoryError);
  }

  return docRef.id;
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
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
};
