import {
  hapticFeedbackNotificationOccurred,
  showPopup,
} from '@telegram-apps/sdk-react'

export type HapticNotificationType = 'success' | 'warning' | 'error'

export function fireHaptic(type: HapticNotificationType = 'success'): void {
  try {
    if (hapticFeedbackNotificationOccurred.isAvailable()) {
      hapticFeedbackNotificationOccurred(type)
    }
  } catch {
    /* not in Telegram or SDK not initialized */
  }
}

export function fireTelegramPopup(title: string, message: string): void {
  try {
    if (showPopup.isAvailable()) {
      // Fire and forget — we don't need the promise here
      void showPopup({ title: title.slice(0, 64), message: message.slice(0, 256) })
    }
  } catch {
    /* ignore */
  }
}
