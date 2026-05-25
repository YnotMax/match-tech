import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React component threw an error', { error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 m-4 flex flex-col gap-2 relative z-50">
          <h2 className="text-lg font-semibold text-red-700">Algo deu errado na interface.</h2>
          <p className="text-red-800 font-mono text-sm break-all">{this.state.error?.message}</p>
          <p className="text-red-600 text-xs mt-2">Consulte o console para mais detalhes.</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded outline outline-1 outline-red-300 w-fit hover:bg-red-200 transition-colors"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
