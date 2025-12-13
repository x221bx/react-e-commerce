/// src/services/shippingService.js
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const SHIPPING_CONFIG_DOC = "shipping_config";

export const getShippingCost = async () => {
  try {
    const docRef = doc(db, "config", SHIPPING_CONFIG_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return Number(data.shippingCost || 50) || 50;
    }

    // Default value if no config exists
    return 50;
  } catch (error) {
    console.error("Error getting shipping cost:", error);
    return 50; // Fallback to default
  }
};

export const setShippingCost = async (cost) => {
  try {
    const costValue = Number(cost);
    if (isNaN(costValue) || costValue < 0) {
      throw new Error("Shipping cost must be a positive number");
    }

    const docRef = doc(db, "config", SHIPPING_CONFIG_DOC);
    await setDoc(docRef, {
      shippingCost: costValue,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return costValue;
  } catch (error) {
    console.error("Error setting shipping cost:", error);
    throw error;
  }
};

export const getShippingConfig = async () => {
  try {
    const docRef = doc(db, "config", SHIPPING_CONFIG_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data();
    }

    return { shippingCost: 50 };
  } catch (error) {
    console.error("Error getting shipping config:", error);
    return { shippingCost: 50 };
  }
};

// Subscribe to shipping cost changes in Firestore (returns unsubscribe)
export const subscribeShippingCost = (onChange) => {
  try {
    const docRef = doc(db, "config", SHIPPING_CONFIG_DOC);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const cost = Number(data.shippingCost || 50) || 50;
          onChange(cost);
        } else {
          onChange(50);
        }
      },
      (err) => {
        console.error("Error subscribing shipping cost:", err);
        onChange(50);
      }
    );

    return unsub;
  } catch (error) {
    console.error("subscribeShippingCost failed:", error);
    return () => {};
  }
};