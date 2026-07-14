import { useEffect } from 'react';

/**
 * Calls `onEscape` when the user presses Escape. Intended for modal/dialog
 * overlays so they can be dismissed via keyboard, matching click-outside-to-close.
 */
export function useEscapeKey(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onEscape, active]);
}
