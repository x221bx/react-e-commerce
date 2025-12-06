// src/services/supportService.js
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Generate a unique ticket ID
const generateTicketId = () => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random
  return `TCK-${timestamp}${random}`;
};

// Send a support message
export const sendSupportMessage = async (user, data) => {
  if (!user?.uid) {
    throw new Error("User must be authenticated");
  }

  const ticketId = generateTicketId();

  const supportData = {
    ticketId,
    uid: user.uid,
    userId: user.uid, // For backward compatibility
    userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
    userEmail: user.email || '',
    phoneNumber: data.phoneNumber || '',
    topic: data.topic || 'General Support',
    message: data.message || '',
    originalMessage: data.message || '',
    description: data.message || '',
    status: 'pending',
    priority: data.priority || 'normal',
    source: data.source || 'web_form',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    replies: []
  };

  const docRef = await addDoc(collection(db, "support"), supportData);
  return {
    id: docRef.id,
    ticketId,
    ...supportData
  };
};

// Export the generateTicketId function for use in other parts
export { generateTicketId };