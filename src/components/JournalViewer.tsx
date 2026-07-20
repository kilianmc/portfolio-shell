import { useEffect, useRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// The dev journal is authored as Markdown and imported as a raw string at build
// time (Vite `?raw`), so it ships as content the shell renders — there is no
// runtime fetch. Kept up to date under docs/ and rendered here on the site.
import journalMd from '../../docs/DEV_JOURNAL.md?raw';
import './JournalViewer.scss';

// Full-viewport overlay that renders the developer journal Markdown. Mirrors
// ProjectViewer's structure/chrome, and adds modal-dialog a11y: Esc to close,
// focus moved into the dialog on open and restored on close. Background scroll
// is locked by App while the overlay is open (same pattern as openProject).
interface JournalViewerProps {
  onClose: () => void;
}

// Render Markdown links as real anchors; external (http) links open in a new
// tab with a safe rel. Relative in-doc links keep default behavior.
function MarkdownLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = /^https?:\/\//i.test(href ?? '');
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

export default function JournalViewer({ onClose }: JournalViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog on open and restore it to the previously focused
  // element (the nav item that opened it) on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
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

  return (
    <div
      className="journal"
      role="dialog"
      aria-modal="true"
      aria-label="Developer Journal"
      ref={dialogRef}
    >
      <div className="journal__bar">
        <button
          type="button"
          className="journal__back"
          onClick={onClose}
          ref={closeRef}
        >
          ← Back to portfolio
        </button>
        <span className="journal__title">Dev Journal</span>
        <button
          type="button"
          className="journal__close"
          onClick={onClose}
          aria-label="Close dev journal"
          title="Close (Esc)"
        >
          ×
        </button>
      </div>

      <div className="journal__frame">
        <article className="journal__prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{ a: MarkdownLink }}
          >
            {journalMd}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
