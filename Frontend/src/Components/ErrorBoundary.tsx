import React, { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ color: '#e53e3e', marginBottom: '16px' }}>
            Oops! Something went wrong.
          </h1>
          <p style={{ color: '#4a5568', marginBottom: '24px' }}>
            We're sorry, but an unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Refresh Page
          </button>
          {import.meta.env.MODE === 'development' && this.state.error && (
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#3182ce' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                backgroundColor: '#f7fafc',
                padding: '16px',
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#2d3748'
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
