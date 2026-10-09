import { Component } from 'react';
import Icon from './Icon';

// If any component throws while rendering, React would normally leave a blank white page.
// This catches it and shows a friendly message instead. (Error boundaries must be classes.)
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="container page-section">
        <div className="state-box" role="alert">
          <div className="state-icon danger"><Icon name="alert" size={28} /></div>
          <h1 className="h3">Something went wrong</h1>
          <p>An unexpected error stopped this page from loading. Your cart and account are safe.</p>
          {/* Plain links on purpose: a full page load clears the broken state */}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <button type="button" className="btn btn-nova-dark" onClick={() => window.location.reload()}>Reload page</button>
            <a href="/" className="btn btn-nova-outline">Back to home</a>
          </div>
        </div>
      </div>
    );
  }
}
