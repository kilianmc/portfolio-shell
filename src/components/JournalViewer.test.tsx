import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalViewer from './JournalViewer';

describe('JournalViewer', () => {
  it('renders a labelled modal dialog with the journal markdown', () => {
    render(<JournalViewer onClose={() => {}} />);

    const dialog = screen.getByRole('dialog', { name: 'Developer Journal' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // The imported Markdown is rendered (its top-level heading appears).
    expect(
      screen.getByRole('heading', { name: /Developer Journal/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('closes when the × button is clicked', async () => {
    const onClose = vi.fn();
    render(<JournalViewer onClose={onClose} />);

    await userEvent.click(
      screen.getByRole('button', { name: /close dev journal/i }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the back button is clicked', async () => {
    const onClose = vi.fn();
    render(<JournalViewer onClose={onClose} />);

    await userEvent.click(
      screen.getByRole('button', { name: /back to portfolio/i }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<JournalViewer onClose={onClose} />);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
