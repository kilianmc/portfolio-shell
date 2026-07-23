import type { AnchorHTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// The dev journal is authored as Markdown and imported as a raw string at build
// time (Vite `?raw`), so it ships as content the shell renders — there is no
// runtime fetch. Kept up to date under docs/ and rendered here on the site.
import journalMd from '../../docs/DEV_JOURNAL.md?raw';
import { useOverlayA11y } from '../hooks/useOverlayA11y';
import './JournalViewer.scss';

// Full-viewport overlay that renders the developer journal Markdown. Mirrors
// ProjectViewer's structure/chrome, and shares its modal-dialog a11y via
// useOverlayA11y: Esc to close, focus moved into the dialog on open and
// restored on close. Background scroll is locked by App while the overlay is
// open (same pattern as openProject).
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
  const { dialogRef, initialFocusRef } = useOverlayA11y<
    HTMLDivElement,
    HTMLButtonElement
  >(onClose);

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
          ref={initialFocusRef}
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
