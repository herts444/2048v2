// src/utils/haptic.js

export const triggerHaptic = (style = 'medium') => {
    if (
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.HapticFeedback
    ) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      console.log(`Haptic feedback triggered: ${style}`);
    } else {
      console.log('HapticFeedback API is not available.');
    }
  };
  