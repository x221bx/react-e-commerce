import { db } from "./services/firebase";
import { collection, getDocs } from "firebase/firestore";

export const testFirebase = async () => {
  const col = collection(db, "test");
  const snapshot = await getDocs(col);
  console.log("✅ Firebase connected:", snapshot.empty);
};
