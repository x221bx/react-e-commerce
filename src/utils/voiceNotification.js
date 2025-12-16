// src/utils/voiceNotification.js
/**
 * Plays a text message using the Web Speech API
 * @param {string} text - The text to speak
 * @param {string} [lang='en-US'] - The language to use for speech synthesis
 */
export const playVoiceNotification = (text, lang = 'en-US') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error playing voice notification:', error);
  }
};

/**
 * Plays a notification sound
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notify.mp3');
    audio.play().catch(e => console.error('Error playing notification sound:', e));
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Plays both voice and sound notification
 * @param {string} text - The text to speak
 * @param {string} [lang='en-US'] - The language to use for speech synthesis
 */
export const playFullNotification = (text, lang = 'en-US') => {
  playNotificationSound();
  playVoiceNotification(text, lang);
};
