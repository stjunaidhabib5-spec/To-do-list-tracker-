'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-6 text-center surface rounded-2xl min-h-64 border border-[var(--destructive)]/20">
          <div className="text-[var(--destructive)] mb-2 font-medium">Something went wrong</div>
          <p className="text-sm text-[var(--foreground-muted)] max-w-sm">
            The calendar component encountered an error and could not be loaded.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
