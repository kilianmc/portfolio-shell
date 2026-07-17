import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// A child that throws on render, to trip the boundary.
function Boom() {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  let consoleError;

  beforeEach(() => {
    // React logs caught render errors to console.error; silence that expected
    // noise so the test output stays readable.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders its children normally when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>portfolio content</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('portfolio content')).toBeInTheDocument();
    // The fallback message must not be present on the happy path.
    expect(screen.queryByText(/Couldn.t load this remote/i)).toBeNull();
  });

  it('renders the fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Couldn.t load this remote/i)).toBeInTheDocument();
    // Without a fallbackUrl it shows the generic unavailable message.
    expect(
      screen.getByText('The remote application is unavailable right now.'),
    ).toBeInTheDocument();
  });

  it('renders a standalone-site link in the fallback when fallbackUrl is set', () => {
    render(
      <ErrorBoundary fallbackUrl="https://example.com/app">
        <Boom />
      </ErrorBoundary>,
    );

    const link = screen.getByRole('link', { name: 'standalone site' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/app');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});
