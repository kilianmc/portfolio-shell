import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Success path: the federation plugin is disabled under Vitest, so the bare
// `fundDashboard/App` specifier is aliased (in vite.config.js) to a local
// stub component — no network is touched. The stub renders identifiable
// content asserted below.
import ProjectViewer from './ProjectViewer';

describe('ProjectViewer (remote resolves)', () => {
  it('returns null for an unknown project id', () => {
    const { container } = render(
      <ProjectViewer projectId="does-not-exist" onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the loading state while the remote is pending', () => {
    render(<ProjectViewer projectId="fund-dashboard" onClose={() => {}} />);

    // Suspense fallback is rendered synchronously before the lazy import
    // resolves on a microtask.
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
    expect(
      screen.getByText('Fetching remoteEntry.js and shared chunks'),
    ).toBeInTheDocument();
    // Remote not mounted yet.
    expect(screen.queryByTestId('remote-app')).toBeNull();
  });

  it('renders the remote once the mocked federated import resolves', async () => {
    render(<ProjectViewer projectId="fund-dashboard" onClose={() => {}} />);

    const remote = await screen.findByTestId('remote-app');
    expect(remote).toHaveTextContent('Fund dashboard remote');
    // Loading state is gone once the remote mounts.
    expect(
      screen.queryByText('Fetching remoteEntry.js and shared chunks'),
    ).toBeNull();
  });

  it('renders the chrome (title, badge, standalone link) around the remote', () => {
    render(<ProjectViewer projectId="fund-dashboard" onClose={() => {}} />);

    expect(
      screen.getByRole('dialog', { name: 'Fund Portfolio Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('remote · Module Federation')).toBeInTheDocument();
    const ext = screen.getByRole('link', { name: /Open standalone/ });
    expect(ext).toHaveAttribute(
      'href',
      'https://ai-portfolio-project1.vercel.app',
    );
  });
});
