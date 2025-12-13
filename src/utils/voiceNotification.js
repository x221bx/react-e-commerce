// src/utils/voiceNotification.js
/**
 * Voice notification utilities using Web Speech API
 * Plays audio sounds and text-to-speech notifications
 */

/**
 * Play notification sound effect
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notify.mp3');
    audio.volume = 0.7;
    audio.play().catch(error => {
      console.debug('Audio play failed:', error);
    });
  } catch (error) {
    console.debug('Error playing notification sound:', error);
  }
};

/**
 * Play voice notification using Web Speech API
 * @param {string} text - The text to speak
 * @param {string} lang - Language code (e.g., 'en-US', 'ar-EG')
 */
export const playVoiceNotification = (text, lang = 'en-US') => {
  if (!('speechSynthesis' in window)) {
    console.debug('Speech synthesis not supported in this browser');
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
    console.debug('Error in speech synthesis:', error);
  }
};

/**
 * Play full notification (sound + voice)
 * @param {string} text - The text to speak
 * @param {string} lang - Language code (e.g., 'en-US', 'ar-EG')
 */
export const playFullNotification = (text, lang = 'en-US') => {
  // Play sound first
  playNotificationSound();

  // Play voice after a small delay to ensure sound starts
  setTimeout(() => {
    playVoiceNotification(text, lang);
  }, 100);
};

export default {
  playNotificationSound,
  playVoiceNotification,
  playFullNotification,
};