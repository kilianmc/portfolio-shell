import { Suspense } from 'react';
import { projects, lazyProjectComponents } from '../data/projects';
import ErrorBoundary from './ErrorBoundary';
import './ProjectViewer.scss';

// Full-viewport overlay that mounts a showcase project inside the shell. It
// supports the two integration patterns: a Module Federation remote (loaded
// lazily via React.lazy, so the shell's initial load never pays for remote
// code) and an embedded independent app (loaded in an <iframe>).
interface ProjectViewerProps {
  projectId: string;
  onClose: () => void;
}

export default function ProjectViewer({
  projectId,
  onClose,
}: ProjectViewerProps) {
  const project = projects.find((p) => p.id === projectId);
  // Only real projects are ever launched (placeholder cards have no launch
  // button); bail out for an unknown or placeholder id.
  if (!project || project.kind === 'placeholder') return null;

  const isEmbedded = project.kind === 'embedded';
  const RemoteApp = lazyProjectComponents[projectId];

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div className="viewer__bar">
        <button type="button" className="viewer__back" onClick={onClose}>
          ← Back to portfolio
        </button>
        <span className="viewer__title">
          {project.title}
          <span className="viewer__badge">
            {isEmbedded
              ? 'iframe · framework-agnostic'
              : 'remote · Module Federation'}
          </span>
        </span>
        <a
          className="viewer__ext"
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open standalone ↗
        </a>
      </div>

      <div className="viewer__frame">
        {isEmbedded ? (
          <iframe
            className="viewer__iframe"
            src={project.embedUrl}
            title={project.title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            allow="fullscreen"
          />
        ) : (
          <ErrorBoundary fallbackUrl={project.liveUrl}>
            <Suspense fallback={<RemoteLoading title={project.title} />}>
              <RemoteApp />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

function RemoteLoading({ title }: { title: string }) {
  return (
    <div className="viewer__loading">
      <div className="spinner" aria-hidden="true" />
      <p>
        Loading <strong>{title}</strong> remote…
      </p>
      <p className="viewer__loading-sub">
        Fetching remoteEntry.js and shared chunks
      </p>
    </div>
  );
}
