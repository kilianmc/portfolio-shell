import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Failure path: the federated remote import rejects (remote offline / version
// mismatch). The rejection surfaces through React.lazy and must be caught by
// the ErrorBoundary so the shell renders a graceful fallback instead of
// unmounting. This lives in its own file so the lazy component isn't cached
// from the success run.
vi.mock('fundDashboard/App', () => {
  throw new Error('remoteEntry.js unreachable');
});

import ProjectViewer from './ProjectViewer';

describe('ProjectViewer (remote fails to load)', () => {
  let consoleError;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders the ErrorBoundary fallback when the remote import rejects', async () => {
    render(<ProjectViewer projectId="fund-dashboard" onClose={() => {}} />);

    // Fallback appears once the rejected lazy import bubbles to the boundary.
    expect(
      await screen.findByText(/Couldn.t load this remote/i),
    ).toBeInTheDocument();

    // The remote never mounts.
    expect(screen.queryByTestId('remote-app')).toBeNull();

    // Fallback offers the standalone site (ErrorBoundary got the project's
    // liveUrl via fallbackUrl).
    const link = screen.getByRole('link', { name: 'standalone site' });
    expect(link).toHaveAttribute(
      'href',
      'https://ai-portfolio-project1.vercel.app',
    );
  });
});
