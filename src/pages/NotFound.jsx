import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Home, ArrowLeft, Search } from 'lucide-react';

/**
 * NotFound (404) Page Component
 *
 * Displays when user navigates to a route that doesn't exist
 * Provides helpful navigation options to get back on track
 *
 * Features:
 * - User-friendly 404 message in dark mode
 * - Navigation options (Go Home, Go Back)
 * - Automatic 404 error logging with user info
 * - Professional dark theme design
 * - Responsive layout
 */
const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Log 404 error to backend
  useEffect(() => {
    const log404Error = async () => {
      try {
        const errorData = {
          type: '404_NOT_FOUND',
          path: window.location.pathname,
          fullUrl: window.location.href,
          referrer: document.referrer || 'direct',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          // User info if authenticated
          userEmail: user?.primaryEmailAddress?.emailAddress || null,
          userId: user?.id || null,
        };

        // Log to backend API
        await fetch('/api/log-error/404', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
        }).catch((err) => {
          // Silently fail - don't let logging break the 404 page
          console.error('Failed to log 404 error:', err);
        });

        // Also log to console in development
        if (import.meta.env.DEV) {
          console.warn('404 Not Found:', errorData);
        }
      } catch (error) {
        // Silently fail
        console.error('Error logging 404:', error);
      }
    };

    log404Error();
  }, [user]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl">
        {/* Header with gradient */}
        <div className="px-8 py-12 text-center bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 border-2 rounded-full bg-white/10 backdrop-blur-sm border-white/20">
            <Search className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-2 font-bold tracking-tight text-white text-7xl">404</h1>
          <p className="text-xl font-medium text-blue-100">Page Not Found</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-gray-100">
              Oops! We couldn't find that page
            </h2>
            <p className="max-w-lg mx-auto leading-relaxed text-gray-400">
              The page you're looking for doesn't exist or may have been moved.
              Don't worry though, you can easily get back on track using the buttons below.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>

            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-100 transition-all bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:border-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <div className="pt-8 mt-8 text-center border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Need help?{' '}
              <a
                href="mailto:support@logilink.com"
                className="font-medium text-blue-400 underline hover:text-blue-300"
              >
                Contact Support
              </a>
            </p>
          </div>

          {/* Show the path they tried to access */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Attempted path: <code className="px-2 py-1 text-blue-400 bg-gray-900 border border-gray-700 rounded">{window.location.pathname}</code>
            </p>
          </div>

          {/* Show user info if authenticated (dev mode only) */}
          {import.meta.env.DEV && user && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Logged in as: {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
