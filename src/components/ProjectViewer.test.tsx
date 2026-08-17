import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Success path: the federation plugin is disabled under Vitest, so the bare
// `fundDashboard/App` specifier is aliased (in vite.config.js) to a local
// stub component — no network is touched. The stub renders identifiable
// content asserted below.
import ProjectViewer from './ProjectViewer';
import { projects } from '../data/projects';

// Titles are editorial copy — derive them from the data so wording tweaks
// don't break these tests (the overlay title/aria-label come from the data).
const fundTitle = projects.find((p) => p.id === 'fund-dashboard')!.title;
const photoTitle = projects.find(
  (p) => p.id === 'photography-portfolio',
)!.title;

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
    expect(remote).toHaveTextContent('Federated remote');
    // Loading state is gone once the remote mounts.
    expect(
      screen.queryByText('Fetching remoteEntry.js and shared chunks'),
    ).toBeNull();
  });

  it('renders the chrome (title, badge, standalone link) around the remote', () => {
    render(<ProjectViewer projectId="fund-dashboard" onClose={() => {}} />);

    expect(screen.getByRole('dialog', { name: fundTitle })).toBeInTheDocument();
    expect(screen.getByText('remote · Module Federation')).toBeInTheDocument();
    // The overlay title truncates (single-line ellipsis) so the full text must
    // stay accessible via a `title` attribute on the title element.
    expect(screen.getByText(fundTitle)).toHaveAttribute('title', fundTitle);
    const ext = screen.getByRole('link', { name: /Open standalone/ });
    expect(ext).toHaveAttribute(
      'href',
      'https://ai-portfolio-project1.vercel.app',
    );
  });
});

describe('ProjectViewer (embedded iframe project)', () => {
  it('renders an <iframe> at the embed URL instead of the federated remote', () => {
    render(
      <ProjectViewer projectId="photography-portfolio" onClose={() => {}} />,
    );

    const dialog = screen.getByRole('dialog', {
      name: photoTitle,
    });
    const iframe = dialog.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute('src', 'https://artlaia.pages.dev');
    expect(iframe).toHaveAttribute('title', photoTitle);

    // The iframe path uses no federated remote loading chrome.
    expect(screen.queryByText(/Fetching remoteEntry.js/)).toBeNull();
    expect(screen.queryByTestId('remote-app')).toBeNull();
  });

  it('shows the iframe-integration badge and a standalone link', () => {
    render(
      <ProjectViewer projectId="photography-portfolio" onClose={() => {}} />,
    );

    expect(screen.getByText('iframe · framework-agnostic')).toBeInTheDocument();
    const ext = screen.getByRole('link', { name: /Open standalone/ });
    expect(ext).toHaveAttribute('href', 'https://artlaia.pages.dev');
  });
});

// Mounts a real trigger button that opens/closes the viewer, mirroring how
// App.tsx launches it — so focus-restore can be asserted against the actual
// launching control.
function LaunchHarness({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Launch in portfolio
      </button>
      {open && (
        <ProjectViewer projectId={projectId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

// Modal-dialog a11y (from useOverlayA11y) must apply to BOTH integration paths.
describe.each([
  ['embedded iframe', 'photography-portfolio'],
  ['federated remote', 'fund-dashboard'],
])('ProjectViewer a11y (%s)', (_label, projectId) => {
  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<ProjectViewer projectId={projectId} onClose={onClose} />);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open and restores it to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<LaunchHarness projectId={projectId} />);

    const launch = screen.getByRole('button', {
      name: /launch in portfolio/i,
    });
    await user.click(launch);

    // Focus is moved onto the overlay's own chrome (the back button).
    const back = await screen.findByRole('button', {
      name: /back to portfolio/i,
    });
    expect(back).toHaveFocus();

    // Closing (via Escape) unmounts the viewer and restores focus to the
    // control that launched it.
    await user.keyboard('{Escape}');
    await waitFor(() => expect(launch).toHaveFocus());
  });
});

describe('ProjectViewer a11y (focus trap chrome)', () => {
  it('wraps Tab / Shift+Tab within the overlay chrome', () => {
    render(
      <ProjectViewer projectId="photography-portfolio" onClose={() => {}} />,
    );

    // The overlay's own focusable chrome is the back button and the standalone
    // link (the cross-origin iframe is not — and cannot be — trapped).
    const back = screen.getByRole('button', { name: /back to portfolio/i });
    const ext = screen.getByRole('link', { name: /open standalone/i });

    // Tab from the last focusable wraps to the first.
    ext.focus();
    expect(ext).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(back).toHaveFocus();

    // Shift+Tab from the first focusable wraps to the last.
    back.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(ext).toHaveFocus();
  });
});
