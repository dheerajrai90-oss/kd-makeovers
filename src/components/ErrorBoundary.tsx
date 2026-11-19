import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  declare props: { children: React.ReactNode };
  state: State = { hasError: false, message: '' };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-kd-black text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-kd-pink/10 border border-kd-rosegold/30 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-kd-pink" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-kd-pink mb-2">
              Something Interrupted This View
            </h2>
            <p className="text-sm text-kd-muted mb-6 leading-relaxed">
              {this.state.message.startsWith('{')
                ? 'A database permission or connectivity error occurred while loading this section.'
                : this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm hover:bg-kd-blush transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
