import { Suspense } from 'react';
import { projects, lazyProjectComponents } from '../data/projects';
import ErrorBoundary from './ErrorBoundary';
import './ProjectViewer.scss';

// Full-viewport overlay that mounts a showcase project's federated remote.
// The remote is only imported when the viewer opens (React.lazy), so the
// shell's initial load never pays for remote code.
export default function ProjectViewer({ projectId, onClose }) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

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
          <span className="viewer__badge">remote · Module Federation</span>
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
        <ErrorBoundary fallbackUrl={project.liveUrl}>
          <Suspense fallback={<RemoteLoading title={project.title} />}>
            <RemoteApp />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function RemoteLoading({ title }) {
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
