import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <h3 className="text-sm font-medium text-red-400">Something went wrong</h3>
          </div>
          <p className="text-xs text-red-300 mb-3">
            There was an error rendering this component. This is likely due to data formatting issues.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                // Try to refresh the component
                window.location.reload();
              }}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors ml-2"
            >
              Try Again
            </button>
          </div>
          {import.meta.env.MODE === 'development' && this.state.error && (
            <details className="mt-3 text-xs">
              <summary className="text-red-300 cursor-pointer">Error Details (Development)</summary>
              <pre className="mt-2 p-2 bg-gray-800 rounded text-red-200 overflow-auto max-h-32">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
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
