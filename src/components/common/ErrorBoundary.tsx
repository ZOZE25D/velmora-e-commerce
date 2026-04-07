import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      
      try {
        const firestoreError = JSON.parse(this.state.error?.message || "");
        if (firestoreError.error && firestoreError.error.includes("insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check your account role.";
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-velmora-50 dark:bg-velmora-950 p-4 transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-velmora-900 rounded-3xl p-8 shadow-xl border border-velmora-100 dark:border-white/5 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-velmora-900 dark:text-white mb-4">Something went wrong</h1>
            <p className="text-velmora-600 dark:text-velmora-400 mb-8 text-sm">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
