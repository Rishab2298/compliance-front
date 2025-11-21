import React from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 *
 * Features:
 * - Graceful error handling with user-friendly UI
 * - Error logging for debugging and monitoring
 * - Recovery options (reload page, go home)
 * - Development vs production error details
 * - Stack trace display in development mode
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external error tracking service (e.g., Sentry)
    // TODO: Integrate with error tracking service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to an error tracking service
    // like Sentry, LogRocket, Rollbar, etc.

    const errorData = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Example: Send to backend API for logging
    if (import.meta.env.PROD) {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData),
        }).catch((err) => {
          console.error('Failed to log error to server:', err);
        });
      } catch (err) {
        // Silently fail - don't let error logging crash the error handler
        console.error('Error logging failed:', err);
      }
    }

    // Development: Log to console with full details
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary - Full Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }
  };

  handleReload = () => {
    // Reset error state and reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    // Reset error state and navigate to home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReset = () => {
    // Try to recover without full page reload
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      const { error, errorInfo, errorCount } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Something went wrong
                  </h1>
                  <p className="text-red-100 text-sm mt-1">
                    We've encountered an unexpected error
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  We're sorry for the inconvenience. The application has encountered an error
                  and needs to recover. Your data is safe, but some functionality may be
                  temporarily unavailable.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {isDevelopment && error && (
                <div className="mb-6 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Bug className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-900 mb-2">
                          Error Details (Development Mode)
                        </h3>
                        <div className="bg-white rounded border border-red-200 p-3 overflow-auto">
                          <code className="text-sm text-red-800 font-mono break-all">
                            {error.toString()}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stack Trace */}
                  {error.stack && (
                    <details className="bg-gray-50 border border-gray-200 rounded-lg">
                      <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        Stack Trace
                      </summary>
                      <div className="px-4 pb-4 pt-2">
                        <pre className="text-xs text-gray-600 overflow-auto bg-white rounded border border-gray-200 p-3 max-h-64">
                          {error.stack}
                        </pre>
                      </div>
                    </details>
                  )}

                  {/* Component Stack */}
                  {errorInfo?.componentStack && (
                    <details className="bg-gray-50 border border-gray-200 rounded-lg">
                      <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        Component Stack
                      </summary>
                      <div className="px-4 pb-4 pt-2">
                        <pre className="text-xs text-gray-600 overflow-auto bg-white rounded border border-gray-200 p-3 max-h-64">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  )}

                  {/* Error Count Warning */}
                  {errorCount > 1 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This error has occurred <strong>{errorCount} times</strong> during this session.
                        You may need to clear your cache or contact support.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Production Error Message */}
              {!isDevelopment && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Error ID:</strong> {Date.now().toString(36)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    If this problem persists, please contact support with the error ID above.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-gray-300 hover:border-gray-400"
                >
                  <Home className="w-5 h-5" />
                  Go to Home
                </button>

                {isDevelopment && (
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                  >
                    Try Recovery
                  </button>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Need help?{' '}
                  <a
                    href="mailto:support@logilink.com"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
