// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '2rem auto',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          borderRadius: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ Something went wrong</h1>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            The application encountered an error. This might be due to:
          </p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Missing environment variables (API keys)</li>
            <li>Browser compatibility issues</li>
            <li>Network connectivity problems</li>
          </ul>
          <details style={{ marginBottom: '1.5rem' }}>
            <summary style={{ cursor: 'pointer', color: '#4dabf7', marginBottom: '0.5rem' }}>
              Technical Details
            </summary>
            <pre style={{
              backgroundColor: '#2a2a2a',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4dabf7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

