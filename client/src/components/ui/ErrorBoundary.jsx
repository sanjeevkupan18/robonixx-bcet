import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-space-900 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl font-display font-black text-white/10 mb-4">ERROR</div>
            <h1 className="font-display font-bold text-2xl text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-outline text-sm">
                Try Again
              </button>
              <Link to="/" className="btn-primary text-sm">Go Home</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
