import { useEffect, useRef } from 'react';

// Modal-dialog accessibility for a full-viewport overlay (ProjectViewer,
// JournalViewer). Both overlays behave identically, so the shared behavior
// lives here:
//   - Escape closes the overlay (calls `onClose`).
//   - Tab / Shift+Tab is kept within the overlay's own focusable chrome
//     (a simple focus trap).
//   - On open, focus moves to `initialFocusRef` (falling back to the dialog);
//     on close, focus is restored to whatever element was focused before the
//     overlay opened — i.e. the control that launched it.
//
// Consumers spread the returned refs onto the dialog container and the element
// that should receive focus on open, e.g.:
//   const { dialogRef, initialFocusRef } =
//     useOverlayA11y<HTMLDivElement, HTMLButtonElement>(onClose);
//
// NOTE — cross-origin iframe limitation: once focus enters a cross-origin
// <iframe> (e.g. the embedded photography portfolio at artlaia.pages.dev), the
// same-origin policy forbids the parent document from reading or moving focus
// inside it. So this trap can only govern the overlay's OWN chrome (back
// button, standalone link, etc.); it cannot pull focus back out of the iframe.
// Escape-to-close still works whenever focus is on that chrome.
export function useOverlayA11y<
  D extends HTMLElement = HTMLDivElement,
  F extends HTMLElement = HTMLElement,
>(onClose: () => void) {
  const dialogRef = useRef<D>(null);
  const initialFocusRef = useRef<F>(null);

  // Move focus into the dialog on open and restore it to the previously focused
  // element (the control that opened it) on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    (initialFocusRef.current ?? dialogRef.current)?.focus?.();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Esc closes; Tab is kept inside the dialog (simple focus trap).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return { dialogRef, initialFocusRef };
}
