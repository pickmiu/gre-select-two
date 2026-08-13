/**
 * Safe Vibration helper supporting mobile browsers & fallback
 */
export function vibrateSuccess(): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([60, 40, 60]);
    } catch {
      // Ignore if blocked by user gesture requirements
    }
  }
}

export function vibrateError(): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 50, 150]);
    } catch {
      // Ignore
    }
  }
}
