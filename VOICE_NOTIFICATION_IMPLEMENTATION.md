# Voice Notification Implementation for Order Cancellation

## Overview
This implementation adds voice notifications to inform customers when their orders are cancelled, including the cancellation reason. The system plays both an audio sound and a voice message using the Web Speech API.

## Features Implemented

### 1. Order Cancellation Notification
- When an admin cancels an order, a notification is now created for the customer
- The notification includes:
  - Title: "Order Cancelled"
  - Message: "Your order #XXX has been cancelled. Reason: [cancellation reason]"
  - Link to order history page
  - Timestamp

### 2. Voice Notification System
- **Audio Sound**: Plays `/notify.mp3` sound file
- **Voice Message**: Uses Web Speech API to read the notification message
- **Language Support**: Automatically detects user language (Arabic or English)
- **Browser Compatibility**: Gracefully falls back if speech synthesis is not supported

### 3. Notification Triggers
Voice notifications are played in two places:
1. **Notifications Page**: When new unread notifications arrive
2. **Navbar**: When the notification badge count increases

## Files Modified

### 1. `src/pages/OrderDetails.jsx`
- Added import for `collection` and `addDoc` from Firebase
- Modified `cancelOrder()` function to create a notification for the customer when order is cancelled
- Notification includes order ID, cancellation reason, and link to order history

### 2. `src/utils/voiceNotification.js` (NEW)
- Created utility functions for voice notifications:
  - `playVoiceNotification(text, lang)`: Uses Web Speech API to speak text
  - `playNotificationSound()`: Plays notification sound effect
  - `playFullNotification(text, lang)`: Plays both sound and voice

### 3. `src/pages/Notifications.jsx`
- Added import for `playFullNotification`
- Added `useRef` to track previous unread count
- Added `useEffect` to play voice notification when new unread notifications arrive
- Notification plays the message of the most recent unread notification

### 4. `src/components/layout/Navbar.jsx`
- Added import for `playFullNotification`
- Added `useRef` to track previous unread count
- Added `useEffect` to play voice notification when notification count increases
- Plays a generic message about new notifications

## How It Works

### Order Cancellation Flow
1. Admin cancels an order and provides a reason
2. Order status is updated to "Cancelled"
3. A notification is created in Firestore for the customer
4. Customer receives the notification in their notifications center
5. When the customer views their notifications, a voice notification plays:
   - Sound effect plays
   - Text-to-speech reads: "Your order #XXX has been cancelled. Reason: [cancellation reason]"

### Voice Notification Flow
1. User receives a new notification
2. System detects unread count has increased
3. Plays notification sound (`/notify.mp3`)
4. Uses Web Speech API to speak the notification message
5. Message is spoken in the user's preferred language (Arabic or English)

## Technical Details

### Web Speech API
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = lang; // 'ar-EG' or 'en-US'
utterance.rate = 1;
utterance.pitch = 1;
window.speechSynthesis.speak(utterance);
```

### Firebase Notification Structure
```javascript
{
  uid: "user-id",
  type: "order-cancelled",
  category: "orders",
  title: "Order Cancelled",
  message: "Your order #XXX has been cancelled. Reason: [reason]",
  createdAt: Timestamp,
  read: false,
  target: "/account/order-history",
  meta: { orderId: "order-id" }
}
```

## Browser Support
- **Speech Synthesis**: Supported in Chrome, Edge, Firefox, Safari
- **Fallback**: If not supported, only the sound effect plays
- **Audio**: Works in all modern browsers

## Testing
To test the voice notifications:
1. Login as admin
2. Go to order details page
3. Cancel an order with a reason
4. Login as the customer
5. Navigate to notifications page or check the navbar
6. Voice notification should play when new notification arrives

## Future Enhancements
- Add user preference to enable/disable voice notifications
- Customize voice (male/female, different accents)
- Add more notification types with voice support
- Store voice preferences in user profile
