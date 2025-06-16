"use client";

import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    // Log error to console for development
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
          <div className="relative w-full max-w-lg p-6 mx-4 bg-white/40 rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-red-800">
                Something went wrong
              </h2>
              <button
                onClick={this.handleReset}
                className="ml-auto p-1 hover:bg-zinc-100 rounded-full transition-colors"
                aria-label="Close error"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Error Message */}
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm font-medium text-red-800 mb-2">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              {this.state.errorInfo && (
                <pre className="text-xs text-red-600 bg-red-50/50 p-2 rounded overflow-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 
                  bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium text-white 
                  bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// A hook to throw errors from anywhere in the app
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return throwError;
};
