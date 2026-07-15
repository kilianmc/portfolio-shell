import { Component } from 'react';

// Guards the shell from a remote that fails to load (network error, remote
// down, version mismatch). Without this, a thrown error in the federated
// module would unmount the whole portfolio.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="viewer__loading">
          <p>⚠️ Couldn&rsquo;t load this remote.</p>
          <p className="viewer__loading-sub">
            {this.props.fallbackUrl ? (
              <>
                It may be offline. Try the{' '}
                <a href={this.props.fallbackUrl} target="_blank" rel="noreferrer">
                  standalone site
                </a>
                .
              </>
            ) : (
              'The remote application is unavailable right now.'
            )}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
